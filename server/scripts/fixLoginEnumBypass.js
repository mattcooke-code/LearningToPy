/**
 * Fix login enum issue with validation bypass
 * Updates enum values without triggering validation
 * Run with: node server/scripts/fixLoginEnumBypass.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');

// Get database connection
const getDatabaseUri = () => {
  const config = require('../config/envConfig');
  return config.getDatabaseUri();
};

async function fixLoginEnumWithBypass() {
  try {
    console.log('Connecting to database...');
    const dbUri = getDatabaseUri();
    await mongoose.connect(dbUri);
    console.log('Connected to database\n');

    // Find users with lowercase streakStatus using direct MongoDB query
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Find users with lowercase streakStatus
    const usersWithLowercase = await usersCollection.find({
      streakStatus: { $regex: '^[a-z]' }
    }).toArray();

    console.log(`Found ${usersWithLowercase.length} users with lowercase streakStatus`);

    if (usersWithLowercase.length > 0) {
      const statusMapping = {
        'active': 'ACTIVE',
        'warning': 'WARNING',
        'at_risk': 'AT_RISK', 
        'resetting': 'RESETTING'
      };

      for (const user of usersWithLowercase) {
        const oldStatus = user.streakStatus;
        const newStatus = statusMapping[oldStatus] || 'ACTIVE';
        
        console.log(`Updating user ${user.username}: ${oldStatus} -> ${newStatus}`);
        
        // Update directly without validation
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { streakStatus: newStatus } }
        );
      }
    }

    // Also check for users with null/undefined streakStatus
    const usersWithNullStatus = await usersCollection.find({
      streakStatus: { $in: [null, undefined, '', { $exists: false }] }
    }).toArray();

    console.log(`Found ${usersWithNullStatus.length} users with null/undefined streakStatus`);

    if (usersWithNullStatus.length > 0) {
      for (const user of usersWithNullStatus) {
        console.log(`Setting default streakStatus for user: ${user.username}`);
        
        // Update directly without validation
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { streakStatus: 'ACTIVE' } }
        );
      }
    }

    // Verify the fix
    console.log('\n=== Verifying Fix ===');
    const stillLowercase = await usersCollection.find({
      streakStatus: { $regex: '^[a-z]' }
    }).toArray();
    
    const stillNull = await usersCollection.find({
      streakStatus: { $in: [null, undefined, '', { $exists: false }] }
    }).toArray();

    console.log(`Users still with lowercase streakStatus: ${stillLowercase.length}`);
    console.log(`Users still with null streakStatus: ${stillNull.length}`);

    if (stillLowercase.length === 0 && stillNull.length === 0) {
      console.log('SUCCESS: All streakStatus values are now uppercase or properly set');
    } else {
      console.log('WARNING: Some users still have invalid streakStatus values');
    }

    console.log('\n=== Fix Complete ===');
    console.log('Login enum issues should now be resolved');
    
    await mongoose.disconnect();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Fix failed:', error);
    process.exit(1);
  }
}

// Run fix if this script is executed directly
if (require.main === module) {
  fixLoginEnumWithBypass();
}

module.exports = { fixLoginEnumWithBypass };
