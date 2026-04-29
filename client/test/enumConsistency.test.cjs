/**
 * Client-side enum consistency test
 * Run with: node client/test/enumConsistency.test.cjs
 */

const fs = require('fs');
const path = require('path');

// Define the expected uppercase enum values
const EXPECTED_ENUMS = {
  difficulty: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
  contentType: ['THEORY', 'EXERCISE', 'QUIZ', 'PROJECT', 'GUIDED_SETUP'],
  validation: ['TESTS', 'OUTPUT', 'NONE'],
  streakStatus: ['ACTIVE', 'WARNING', 'AT_RISK', 'RESETTING']
};

// Define old lowercase values that should NOT exist
const FORBIDDEN_VALUES = {
  difficulty: ['beginner', 'intermediate', 'advanced'],
  contentType: ['theory', 'exercise', 'quiz', 'project', 'guided-setup'],
  validation: ['tests', 'output', 'none'],
  streakStatus: ['active', 'warning', 'at_risk', 'resetting']
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

function findJSFiles(dir, excludeDirs = ['node_modules', '.git', 'dist', 'build']) {
  const files = [];
  
  function traverse(currentDir) {
    try {
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
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  traverse(dir);
  return files;
}

console.log('=== Client-Side Enum Consistency Test ===\n');

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

// Check for expected uppercase values in key files
console.log('Verifying uppercase enum values in key client files...\n');

const keyClientFiles = [
  'src/utils/platformDefaults.js',
  'src/utils/moduleFormUtils.js', 
  'src/utils/lessonFormUtils.js',
  'src/constants/settingsConfigs.js',
  'src/hooks/useStreakNotifications.js',
  'src/utils/validationUtils.js'
];

keyClientFiles.forEach(file => {
  const fullPath = path.join(rootDir, file);
  if (fs.existsSync(fullPath)) {
    console.log(`\u2705 ${file} exists`);
  } else {
    console.log(`\u274c ${file} missing`);
    issuesFound++;
  }
});

console.log('\n=== Test Results ===');
if (issuesFound === 0) {
  console.log('\u2704 All client-side enum consistency checks passed!');
  console.log('All enums are properly standardized to uppercase.');
} else {
  console.log(`\u274c Found ${issuesFound} client-side enum consistency issues that need to be fixed.`);
  console.log('Please review the issues above and update the files accordingly.');
}

console.log('\n=== Expected Client-Side Enum Values ===');
Object.entries(EXPECTED_ENUMS).forEach(([enumName, values]) => {
  console.log(`${enumName}: [${values.map(v => `"${v}"`).join(', ')}]`);
});

console.log('\n=== Test Complete ===');
