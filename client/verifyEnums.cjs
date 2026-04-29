const fs = require('fs');

const files = [
  'src/utils/platformDefaults.js',
  'src/utils/moduleFormUtils.js', 
  'src/utils/lessonFormUtils.js',
  'src/constants/settingsConfigs.js',
  'src/hooks/useStreakNotifications.js'
];

console.log('=== Client-Side Enum Verification ===\n');

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const hasUppercase = content.includes('BEGINNER') || content.includes('THEORY') || content.includes('WARNING');
    const hasLowercase = content.includes('"beginner"') || content.includes('"theory"') || content.includes('"warning"');
    
    console.log(file + ': ' + (hasUppercase && !hasLowercase ? 'UPPERCASE OK' : 'NEEDS FIX'));
    
    if (hasLowercase) {
      console.log('  Found lowercase values');
    }
    if (!hasUppercase) {
      console.log('  No uppercase values found');
    }
  } catch (e) {
    console.log(file + ': ERROR - ' + e.message);
  }
});

console.log('\n=== Verification Complete ===');
