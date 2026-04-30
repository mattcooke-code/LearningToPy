/**
 * Quick fix for login enum validation error
 * Specifically fixes any users with lowercase streakStatus values
 * Run with: node server/scripts/fixLoginEnum.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');

// Get database connection
const getDatabaseUri = () => {
  const config = require('../config/envConfig');
  return config.getDatabaseUri();
};

async function fixLoginEnumIssue() {
  try {
    console.log('Connecting to database...');
    const dbUri = getDatabaseUri();
    await mongoose.connect(dbUri);
    console.log('Connected to database\n');

    // Find any user with lowercase streakStatus
    const usersWithLowercaseStatus = await User.find({
      streakStatus: { $regex: '^[a-z]' } // Any lowercase value
    });

    console.log(`Found ${usersWithLowercaseStatus.length} users with lowercase streakStatus`);

    if (usersWithLowercaseStatus.length === 0) {
      console.log('No users with lowercase streakStatus found');
      
      // Let's also check if there are any users without streakStatus set
      const usersWithoutStatus = await User.find({ streakStatus: { $exists: false } });
      console.log(`Found ${usersWithoutStatus.length} users without streakStatus`);
      
      if (usersWithoutStatus.length > 0) {
        console.log('Setting default streakStatus for users without it...');
        for (const user of usersWithoutStatus) {
          user.streakStatus = 'ACTIVE';
          await user.save();
          console.log(`Set default streakStatus for user: ${user.username}`);
        }
      }
      
      // Check for null/undefined streakStatus
      const usersWithNullStatus = await User.find({ 
        streakStatus: { $in: [null, undefined, ''] }
      });
      console.log(`Found ${usersWithNullStatus.length} users with null/undefined streakStatus`);
      
      if (usersWithNullStatus.length > 0) {
        console.log('Setting default streakStatus for users with null values...');
        for (const user of usersWithNullStatus) {
          user.streakStatus = 'ACTIVE';
          await user.save();
          console.log(`Set default streakStatus for user: ${user.username}`);
        }
      }
      
    } else {
      // Fix lowercase values
      const statusMapping = {
        'active': 'ACTIVE',
        'warning': 'WARNING',
        'at_risk': 'AT_RISK', 
        'resetting': 'RESETTING'
      };

      for (const user of usersWithLowercaseStatus) {
        const oldStatus = user.streakStatus;
        const newStatus = statusMapping[oldStatus] || 'ACTIVE';
        
        user.streakStatus = newStatus;
        await user.save();
        
        console.log(`Fixed user ${user.username}: ${oldStatus} -> ${newStatus}`);
      }
    }

    // Let's also check the specific user that might be causing the issue
    // Check if there's a user with the username that was causing the error
    console.log('\n=== Checking for specific user issues ===');
    
    // Look for any user that might have validation issues
    const allUsers = await User.find({});
    console.log(`Total users in database: ${allUsers.length}`);
    
    for (const user of allUsers) {
      if (!user.streakStatus || typeof user.streakStatus !== 'string') {
        console.log(`User ${user.username} has invalid streakStatus: ${user.streakStatus}`);
        user.streakStatus = 'ACTIVE';
        await user.save();
        console.log(`Fixed streakStatus for user: ${user.username}`);
      }
    }

    console.log('\n=== Fix Complete ===');
    console.log('All login enum issues should be resolved');
    
    await mongoose.disconnect();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Fix failed:', error);
    process.exit(1);
  }
}

// Run fix if this script is executed directly
if (require.main === module) {
  fixLoginEnumIssue();
}

module.exports = { fixLoginEnumIssue };
