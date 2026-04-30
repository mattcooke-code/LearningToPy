/**
 * Database Migration Script
 * Updates existing lowercase enum values to uppercase
 * Run with: node server/scripts/migrateEnums.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');

// Get database connection
const getDatabaseUri = () => {
  const config = require('../config/envConfig');
  return config.getDatabaseUri();
};

// Enum mappings from lowercase to uppercase
const ENUM_MAPPINGS = {
  streakStatus: {
    'active': 'ACTIVE',
    'warning': 'WARNING', 
    'at_risk': 'AT_RISK',
    'resetting': 'RESETTING'
  },
  difficulty: {
    'beginner': 'BEGINNER',
    'intermediate': 'INTERMEDIATE',
    'advanced': 'ADVANCED'
  },
  contentType: {
    'theory': 'THEORY',
    'exercise': 'EXERCISE',
    'quiz': 'QUIZ',
    'project': 'PROJECT',
    'guided-setup': 'GUIDED_SETUP'
  },
  validation: {
    'tests': 'TESTS',
    'output': 'OUTPUT',
    'none': 'NONE'
  },
  xpHistorySource: {
    'lesson_completion': 'LESSON_COMPLETION',
    'lesson_quiz': 'LESSON_QUIZ',
    'exercise': 'EXERCISE',
    'module_quiz': 'MODULE_QUIZ',
    'module_completion': 'MODULE_COMPLETION',
    'bonus': 'BONUS'
  }
};

async function migrateUserEnums() {
  console.log('=== Migrating User Enum Values ===\n');
  
  try {
    // Find users with lowercase streakStatus
    const usersWithLowercaseStreak = await User.find({
      streakStatus: { $in: Object.keys(ENUM_MAPPINGS.streakStatus) }
    });
    
    console.log(`Found ${usersWithLowercaseStreak.length} users with lowercase streakStatus`);
    
    for (const user of usersWithLowercaseStreak) {
      const oldStatus = user.streakStatus;
      const newStatus = ENUM_MAPPINGS.streakStatus[oldStatus];
      
      user.streakStatus = newStatus;
      await user.save();
      
      console.log(`Updated user ${user.username}: ${oldStatus} -> ${newStatus}`);
    }
    
    // Update xpHistory source values
    const usersWithLowercaseXP = await User.find({
      'xpHistory.source': { $in: Object.keys(ENUM_MAPPINGS.xpHistorySource) }
    });
    
    console.log(`\nFound ${usersWithLowercaseXP.length} users with lowercase xpHistory.source`);
    
    for (const user of usersWithLowercaseXP) {
      let updated = false;
      
      user.xpHistory.forEach((entry, index) => {
        if (ENUM_MAPPINGS.xpHistorySource[entry.source]) {
          const oldSource = entry.source;
          entry.source = ENUM_MAPPINGS.xpHistorySource[oldSource];
          updated = true;
          
          if (index === 0) { // Log only first change per user to avoid spam
            console.log(`Updated XP history for user ${user.username}: ${oldSource} -> ${entry.source}`);
          }
        }
      });
      
      if (updated) {
        await user.save();
      }
    }
    
    console.log('\nUser enum migration completed successfully');
    
  } catch (error) {
    console.error('Error migrating user enums:', error);
    throw error;
  }
}

async function migrateModuleEnums() {
  console.log('\n=== Migrating Module Enum Values ===\n');
  
  try {
    const modulesWithLowercaseDifficulty = await Module.find({
      difficulty: { $in: Object.keys(ENUM_MAPPINGS.difficulty) }
    });
    
    console.log(`Found ${modulesWithLowercaseDifficulty.length} modules with lowercase difficulty`);
    
    for (const module of modulesWithLowercaseDifficulty) {
      const oldDifficulty = module.difficulty;
      const newDifficulty = ENUM_MAPPINGS.difficulty[oldDifficulty];
      
      module.difficulty = newDifficulty;
      await module.save();
      
      console.log(`Updated module ${module.title || module._id}: ${oldDifficulty} -> ${newDifficulty}`);
    }
    
    console.log('\nModule enum migration completed successfully');
    
  } catch (error) {
    console.error('Error migrating module enums:', error);
    throw error;
  }
}

async function migrateLessonEnums() {
  console.log('\n=== Migrating Lesson Enum Values ===\n');
  
  try {
    // Update contentType
    const lessonsWithLowercaseContentType = await Lesson.find({
      contentType: { $in: Object.keys(ENUM_MAPPINGS.contentType) }
    });
    
    console.log(`Found ${lessonsWithLowercaseContentType.length} lessons with lowercase contentType`);
    
    for (const lesson of lessonsWithLowercaseContentType) {
      const oldContentType = lesson.contentType;
      const newContentType = ENUM_MAPPINGS.contentType[oldContentType];
      
      lesson.contentType = newContentType;
      await lesson.save();
      
      console.log(`Updated lesson ${lesson.title || lesson._id}: ${oldContentType} -> ${newContentType}`);
    }
    
    // Update difficulty
    const lessonsWithLowercaseDifficulty = await Lesson.find({
      difficulty: { $in: Object.keys(ENUM_MAPPINGS.difficulty) }
    });
    
    console.log(`\nFound ${lessonsWithLowercaseDifficulty.length} lessons with lowercase difficulty`);
    
    for (const lesson of lessonsWithLowercaseDifficulty) {
      const oldDifficulty = lesson.difficulty;
      const newDifficulty = ENUM_MAPPINGS.difficulty[oldDifficulty];
      
      lesson.difficulty = newDifficulty;
      await lesson.save();
      
      console.log(`Updated lesson ${lesson.title || lesson._id}: ${oldDifficulty} -> ${newDifficulty}`);
    }
    
    // Update exercise.validation
    const lessonsWithLowercaseValidation = await Lesson.find({
      'exercise.validation': { $in: Object.keys(ENUM_MAPPINGS.validation) }
    });
    
    console.log(`\nFound ${lessonsWithLowercaseValidation.length} lessons with lowercase exercise.validation`);
    
    for (const lesson of lessonsWithLowercaseValidation) {
      const oldValidation = lesson.exercise.validation;
      const newValidation = ENUM_MAPPINGS.validation[oldValidation];
      
      lesson.exercise.validation = newValidation;
      await lesson.save();
      
      console.log(`Updated lesson ${lesson.title || lesson._id}: ${oldValidation} -> ${newValidation}`);
    }
    
    console.log('\nLesson enum migration completed successfully');
    
  } catch (error) {
    console.error('Error migrating lesson enums:', error);
    throw error;
  }
}

async function runMigration() {
  try {
    console.log('Starting enum migration...\n');
    
    // Connect to database
    const dbUri = getDatabaseUri();
    await mongoose.connect(dbUri);
    console.log('Connected to database\n');
    
    // Run migrations
    await migrateUserEnums();
    await migrateModuleEnums();
    await migrateLessonEnums();
    
    console.log('\n=== Migration Complete ===');
    console.log('All enum values have been updated to uppercase format');
    
    // Close connection
    await mongoose.disconnect();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  runMigration,
  migrateUserEnums,
  migrateModuleEnums,
  migrateLessonEnums,
  ENUM_MAPPINGS
};
