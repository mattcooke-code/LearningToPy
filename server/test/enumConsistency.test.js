/**
 * Test file to verify enum consistency across the entire codebase
 * Run with: node test/enumConsistency.test.js
 */

const fs = require('fs');
const path = require('path');

// Define the expected uppercase enum values
const EXPECTED_ENUMS = {
  streakStatus: ['ACTIVE', 'WARNING', 'AT_RISK', 'RESETTING'],
  xpHistorySource: ['LESSON_COMPLETION', 'LESSON_QUIZ', 'EXERCISE', 'MODULE_QUIZ', 'MODULE_COMPLETION', 'BONUS'],
  difficulty: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
  contentType: ['THEORY', 'EXERCISE', 'QUIZ', 'PROJECT', 'GUIDED_SETUP'],
  validation: ['TESTS', 'OUTPUT', 'NONE'],
  actionType: [
    'PAGE_VIEW', 'LESSON_START', 'LESSON_COMPLETE', 'QUIZ_ATTEMPT', 
    'QUIZ_CORRECT', 'QUIZ_INCORRECT', 'CODE_RUN', 'CODE_SUCCESS', 
    'CODE_ERROR', 'SESSION_START', 'SESSION_END', 'EXERCISE_ATTEMPT', 'EXERCISE_COMPLETE'
  ],
  adminAction: [
    'USER_MADE_ADMIN', 'USER_REMOVED_ADMIN', 'XP_ADJUSTMENT', 'USER_BLOCKED',
    'USER_UNBLOCKED', 'USER_DELETED', 'AWARD_BADGES', 'REMOVE_BADGES',
    'LESSON_COMPLETED_OVERRIDE', 'LESSON_INCOMPLETE_OVERRIDE', 'MODULE_COMPLETED_OVERRIDE',
    'MODULE_INCOMPLETE_OVERRIDE', 'FLAG_RESOLVED', 'SETTINGS_UPDATED', 'LESSON_CREATED',
    'LESSON_UPDATED', 'LESSON_DELETED', 'LESSON_PUBLISHED', 'LESSON_UNPUBLISHED',
    'LESSON_DUPLICATED', 'MODULE_CREATED', 'MODULE_UPDATED', 'MODULE_DELETED',
    'MODULE_PUBLISHED', 'MODULE_UNPUBLISHED', 'MODULE_DUPLICATED'
  ],
  targetType: ['USER', 'LESSON', 'MODULE', 'BADGE', 'FLAG', 'SETTINGS'],
  flaggedTargetType: ['LESSON', 'EXERCISE', 'QUIZ'],
  issueType: ['CONTENT_ERROR', 'CODE_ERROR', 'QUIZ_ERROR', 'BROKEN_FUNCTIONALITY', 'XP_ADJUSTMENT', 'OTHER'],
  flaggedStatus: ['PENDING', 'IN_REVIEW', 'FIXED', 'REJECTED', 'XP_ADJUSTED']
};

// Define old lowercase values that should NOT exist
const FORBIDDEN_VALUES = {
  streakStatus: ['active', 'warning', 'at_risk', 'resetting'],
  xpHistorySource: ['lesson_completion', 'lesson_quiz', 'exercise', 'module_quiz', 'module_completion', 'bonus'],
  difficulty: ['beginner', 'intermediate', 'advanced'],
  contentType: ['theory', 'exercise', 'quiz', 'project', 'guided-setup'],
  validation: ['tests', 'output', 'none']
};

function searchInFile(filePath, patterns) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = [];
    
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'gi');
      const matches = content.match(regex);
      if (matches) {
        results.push(...matches);
      }
    });
    
    return results;
  } catch (error) {
    return [];
  }
}

function findJSFiles(dir, excludeDirs = ['node_modules', '.git']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !excludeDirs.includes(item)) {
        traverse(fullPath);
      } else if (stat.isFile() && item.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

console.log('=== Enum Consistency Test ===\n');

const rootDir = path.join(__dirname, '..');
const jsFiles = findJSFiles(rootDir);

let issuesFound = 0;

// Check for forbidden lowercase values
console.log('Checking for forbidden lowercase enum values...\n');

Object.entries(FORBIDDEN_VALUES).forEach(([enumName, forbiddenValues]) => {
  console.log(`Checking ${enumName}:`);
  
  forbiddenValues.forEach(value => {
    const pattern = `"${value}"|'${value}'|\\b${value}\\b`;
    const filesWithIssues = [];
    
    jsFiles.forEach(file => {
      const matches = searchInFile(file, [pattern]);
      if (matches.length > 0) {
        filesWithIssues.push({ file, matches });
      }
    });
    
    if (filesWithIssues.length > 0) {
      console.log(`  \u274c Found "${value}" in:`);
      filesWithIssues.forEach(({ file, matches }) => {
        console.log(`    - ${path.relative(rootDir, file)} (${matches.length} occurrences)`);
      });
      issuesFound++;
    } else {
      console.log(`  \u2704 No occurrences of "${value}" found`);
    }
  });
  
  console.log('');
});

// Check for expected uppercase values in schemas
console.log('Verifying uppercase enum values in schemas...\n');

const schemaFiles = [
  'models/User.js',
  'models/Module.js', 
  'models/Lesson.js',
  'models/ActivityLog.js',
  'models/AdminLog.js',
  'models/FlaggedContent.js'
];

schemaFiles.forEach(schemaFile => {
  const fullPath = path.join(rootDir, schemaFile);
  if (fs.existsSync(fullPath)) {
    console.log(`\u2705 ${schemaFile} exists`);
  } else {
    console.log(`\u274c ${schemaFile} missing`);
    issuesFound++;
  }
});

console.log('\n=== Test Results ===');
if (issuesFound === 0) {
  console.log('\u2704 All enum consistency checks passed!');
  console.log('All enums are properly standardized to uppercase.');
} else {
  console.log(`\u274c Found ${issuesFound} enum consistency issues that need to be fixed.`);
  console.log('Please review the issues above and update the files accordingly.');
}

console.log('\n=== Expected Enum Values ===');
Object.entries(EXPECTED_ENUMS).forEach(([enumName, values]) => {
  console.log(`${enumName}: [${values.map(v => `"${v}"`).join(', ')}]`);
});

console.log('\n=== Test Complete ===');
