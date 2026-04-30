/**
 * Fix XP History Enum Values
 * Updates lowercase xpHistory.source values to uppercase
 * Run with: node server/scripts/fixXPHistoryEnums.js
 */

const mongoose = require('mongoose');

// Get database connection
const getDatabaseUri = () => {
  const config = require('../config/envConfig');
  return config.getDatabaseUri();
};

// XP History source enum mapping
const SOURCE_MAPPING = {
  'lesson_completion': 'LESSON_COMPLETION',
  'lesson_quiz': 'LESSON_QUIZ',
  'exercise': 'EXERCISE',
  'module_quiz': 'MODULE_QUIZ',
  'module_completion': 'MODULE_COMPLETION',
  'bonus': 'BONUS'
};

async function fixXPHistoryEnums() {
  try {
    console.log('=== Fixing XP History Enum Values ===\n');
    
    // Connect to database
    const dbUri = getDatabaseUri();
    await mongoose.connect(dbUri);
    console.log('Connected to database\n');
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Find all users with xpHistory containing lowercase source values
    const usersWithLowercaseXP = await usersCollection.find({
      'xpHistory.source': { $in: Object.keys(SOURCE_MAPPING) }
    }).toArray();
    
    console.log(`Found ${usersWithLowercaseXP.length} users with lowercase xpHistory.source values\n`);
    
    let updatedCount = 0;
    
    for (const user of usersWithLowercaseXP) {
      let userUpdated = false;
      
      if (user.xpHistory && Array.isArray(user.xpHistory)) {
        for (const entry of user.xpHistory) {
          if (entry.source && SOURCE_MAPPING[entry.source]) {
            const oldSource = entry.source;
            entry.source = SOURCE_MAPPING[oldSource];
            userUpdated = true;
            console.log(`  User ${user.username || user._id}: ${oldSource} -> ${entry.source}`);
          }
        }
      }
      
      if (userUpdated) {
        // Update the user document directly
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { xpHistory: user.xpHistory } }
        );
        updatedCount++;
        console.log(`  Updated user: ${user.username || user._id}\n`);
      }
    }
    
    // Also check for users with xpHistory that has null/undefined sources
    const usersWithInvalidSources = await usersCollection.find({
      xpHistory: { $exists: true }
    }).toArray();
    
    let invalidCount = 0;
    
    for (const user of usersWithInvalidSources) {
      if (user.xpHistory && Array.isArray(user.xpHistory)) {
        let hasInvalidSource = false;
        
        for (const entry of user.xpHistory) {
          // Check for invalid or missing source
          if (!entry.source || entry.source === '' || entry.source === null || entry.source === undefined) {
            entry.source = 'LESSON_COMPLETION'; // Default value
            hasInvalidSource = true;
          }
          
          // Check if source is not in the allowed enum values
          const validSources = Object.values(SOURCE_MAPPING);
          if (!validSources.includes(entry.source) && !Object.keys(SOURCE_MAPPING).includes(entry.source)) {
            console.log(`  User ${user.username || user._id} has unexpected source: ${entry.source}`);
          }
        }
        
        if (hasInvalidSource) {
          await usersCollection.updateOne(
            { _id: user._id },
            { $set: { xpHistory: user.xpHistory } }
          );
          invalidCount++;
          console.log(`  Fixed invalid source for user: ${user.username || user._id}`);
        }
      }
    }
    
    // Verify the fix
    console.log('\n=== Verification ===');
    const stillLowercase = await usersCollection.find({
      'xpHistory.source': { $in: Object.keys(SOURCE_MAPPING) }
    }).toArray();
    
    console.log(`Users still with lowercase xpHistory.source: ${stillLowercase.length}`);
    
    if (stillLowercase.length === 0) {
      console.log('SUCCESS: All xpHistory.source values are now uppercase!');
    } else {
      console.log('WARNING: Some users still have lowercase xpHistory.source values');
      stillLowercase.forEach(user => {
        console.log(`  - ${user.username || user._id}`);
      });
    }
    
    console.log(`\n=== Summary ===`);
    console.log(`Total users processed: ${usersWithLowercaseXP.length}`);
    console.log(`Users updated: ${updatedCount}`);
    console.log(`Invalid sources fixed: ${invalidCount}`);
    
    await mongoose.disconnect();
    console.log('\nDatabase connection closed');
    
  } catch (error) {
    console.error('Fix failed:', error);
    process.exit(1);
  }
}

// Run fix if this script is executed directly
if (require.main === module) {
  fixXPHistoryEnums();
}

module.exports = { fixXPHistoryEnums };
