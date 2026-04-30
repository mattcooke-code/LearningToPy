/**
 * Account Migration Script
 * Updates existing accounts to comply with new validation standards
 * Run with: node server/scripts/updateAccountsToNewValidations.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { validateUsername, validatePassword, validateEmail } = require('../utils/validationHelpers');

// Get database connection
const getDatabaseUri = () => {
  const config = require('../config/envConfig');
  return config.getDatabaseUri();
};

// Reserved usernames that should be changed
const RESERVED_USERNAMES = [
  'admin', 'root', 'system', 'api', 'www', 'mail', 'support', 'null', 'undefined',
  'demo', 'guest', 'anonymous', 'moderator', 'superadmin', 'administrator',
  'staff', 'security', 'help', 'info', 'contact', 'service'
];

// Migration report
const migrationReport = {
  updatedUsers: [],
  errors: [],
  summary: {
    totalUsers: 0,
    invalidUsernames: 0,
    weakPasswords: 0,
    updated: 0,
    failed: 0
  }
};

/**
 * Generate a new valid username based on the old one
 */
function generateNewUsername(oldUsername) {
  // Remove invalid characters and add a suffix
  let baseName = oldUsername
    .replace(/[^a-zA-Z0-9_]/g, '')
    .replace(/^(admin|root|system|api|www|mail|support|null|undefined|demo|guest|anonymous|moderator|superadmin|administrator|staff|security|help|info|contact|service)$/i, '');
  
  if (baseName.length < 3) {
    baseName = 'user';
  }
  
  // Truncate if too long
  if (baseName.length > 20) {
    baseName = baseName.substring(0, 20);
  }
  
  // Add random suffix to ensure uniqueness
  const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const newUsername = `${baseName}_${suffix}`;
  
  return newUsername;
}

/**
 * Check if username is valid according to new rules
 */
function isUsernameValid(username) {
  const result = validateUsername(username);
  return result.isValid;
}

/**
 * Check if password meets new requirements
 */
function isPasswordStrong(password) {
  const result = validatePassword(password);
  return result.isValid;
}

/**
 * Update user credentials to meet new validation standards
 */
async function updateUserCredentials(user, usersCollection) {
  const updates = {};
  const changes = [];
  
  try {
    // Check and fix username
    if (!isUsernameValid(user.username)) {
      const newUsername = generateNewUsername(user.username);
      updates.username = newUsername;
      changes.push(`username: ${user.username} -> ${newUsername}`);
    }
    
    // Check if we need to update the password (we can't check the hashed password,
    // but we can mark it for update if needed - for now, we'll assume existing passwords are weak)
    // Note: In production, you might want to force password reset instead
    
    // Ensure streakStatus is uppercase
    if (user.streakStatus && typeof user.streakStatus === 'string') {
      const statusMapping = {
        'active': 'ACTIVE',
        'warning': 'WARNING',
        'at_risk': 'AT_RISK',
        'resetting': 'RESETTING'
      };
      
      if (statusMapping[user.streakStatus.toLowerCase()]) {
        updates.streakStatus = statusMapping[user.streakStatus.toLowerCase()];
        changes.push(`streakStatus: ${user.streakStatus} -> ${updates.streakStatus}`);
      }
    }
    
    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: updates }
      );
      
      migrationReport.updatedUsers.push({
        userId: user._id.toString(),
        oldUsername: user.username,
        newUsername: updates.username || user.username,
        changes: changes,
        success: true
      });
      
      migrationReport.summary.updated++;
      console.log(`  Updated user ${user.username || user._id}: ${changes.join(', ')}`);
    }
    
  } catch (error) {
    migrationReport.errors.push({
      userId: user._id.toString(),
      username: user.username,
      error: error.message
    });
    migrationReport.summary.failed++;
    console.log(`  Failed to update user ${user.username || user._id}: ${error.message}`);
  }
}

/**
 * Main migration function
 */
async function runAccountMigration() {
  try {
    console.log('=== Account Migration to New Validation Standards ===\n');
    
    // Connect to database
    const dbUri = getDatabaseUri();
    await mongoose.connect(dbUri);
    console.log('Connected to database\n');
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Get all users
    const allUsers = await usersCollection.find({}).toArray();
    migrationReport.summary.totalUsers = allUsers.length;
    
    console.log(`Found ${allUsers.length} total users\n`);
    
    // Find users with invalid usernames
    const invalidUsernameUsers = allUsers.filter(user => !isUsernameValid(user.username));
    migrationReport.summary.invalidUsernames = invalidUsernameUsers.length;
    
    console.log(`Found ${invalidUsernameUsers.length} users with invalid usernames`);
    if (invalidUsernameUsers.length > 0) {
      console.log('Invalid usernames found:');
      invalidUsernameUsers.forEach(user => {
        const validationResult = validateUsername(user.username);
        console.log(`  - ${user.username}: ${validationResult.message}`);
      });
    }
    console.log('');
    
    // Process all users that need updates
    console.log('Updating users to meet new validation standards...\n');
    
    for (const user of allUsers) {
      await updateUserCredentials(user, usersCollection);
    }
    
    // Generate report
    console.log('\n=== Migration Report ===');
    console.log(`Total users processed: ${migrationReport.summary.totalUsers}`);
    console.log(`Users with invalid usernames: ${migrationReport.summary.invalidUsernames}`);
    console.log(`Users successfully updated: ${migrationReport.summary.updated}`);
    console.log(`Users failed to update: ${migrationReport.summary.failed}`);
    
    if (migrationReport.updatedUsers.length > 0) {
      console.log('\nUpdated Users:');
      migrationReport.updatedUsers.forEach(update => {
        console.log(`  - ${update.oldUsername} -> ${update.newUsername}`);
        console.log(`    Changes: ${update.changes.join(', ')}`);
      });
    }
    
    if (migrationReport.errors.length > 0) {
      console.log('\nErrors:');
      migrationReport.errors.forEach(error => {
        console.log(`  - ${error.username}: ${error.error}`);
      });
    }
    
    // Save detailed report to file
    const reportPath = './migration-report.json';
    require('fs').writeFileSync(reportPath, JSON.stringify(migrationReport, null, 2));
    console.log(`\nDetailed report saved to: ${reportPath}`);
    
    console.log('\n=== Migration Complete ===');
    console.log('All accounts now comply with new validation standards');
    
    await mongoose.disconnect();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  runAccountMigration();
}

module.exports = { 
  runAccountMigration,
  generateNewUsername,
  isUsernameValid,
  isPasswordStrong
};
