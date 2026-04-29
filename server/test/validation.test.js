/**
 * Test file for validation helpers and schema validations
 * Run with: node test/validation.test.js
 */

const mongoose = require('mongoose');
const { validateEmail, validatePassword, validateUsername, validateContent } = require('../utils/validationHelpers');

// Test validation helpers
console.log('=== Testing Validation Helpers ===\n');

// Email tests
console.log('Email Validation Tests:');
console.log('Valid email:', validateEmail('user@example.com'));
console.log('Invalid email:', validateEmail('invalid-email'));
console.log('Disposable email:', validateEmail('user@tempmail.com'));
console.log('Missing email:', validateEmail(''));
console.log('');

// Password tests
console.log('Password Validation Tests:');
console.log('Valid password:', validatePassword('SecurePass123!'));
console.log('Too short:', validatePassword('short'));
console.log('No special char:', validatePassword('SecurePass123'));
console.log('Common password:', validatePassword('password123'));
console.log('');

// Username tests  
console.log('Username Validation Tests:');
console.log('Valid username:', validateUsername('testuser123'));
console.log('Reserved name:', validateUsername('admin'));
console.log('Invalid chars:', validateUsername('test-user'));
console.log('Too short:', validateUsername('ab'));
console.log('');

// Content tests
console.log('Content Validation Tests:');
console.log('Valid content:', validateContent('This is safe content'));
console.log('Script tag:', validateContent('<script>alert("xss")</script>'));
console.log('JavaScript:', validateContent('javascript:alert("xss")'));
console.log('Event handler:', validateContent('<div onclick="alert()">Test</div>'));
console.log('');

// Test schema compilation (basic check)
console.log('=== Testing Schema Compilation ===\n');

try {
  // Try to load all models to ensure they compile correctly
  const User = require('../models/User');
  const Module = require('../models/Module');
  const Lesson = require('../models/Lesson');
  const ActivityLog = require('../models/ActivityLog');
  const AdminLog = require('../models/AdminLog');
  const FlaggedContent = require('../models/FlaggedContent');
  
  console.log('All models loaded successfully!');
  
  // Test enum values are uppercase
  console.log('User streakStatus enum:', User.schema.paths.streakStatus.enumValues);
  console.log('User xpHistory.source enum:', User.schema.paths.xpHistory.schema.paths.source.enumValues);
  console.log('Module difficulty enum:', Module.schema.paths.difficulty.enumValues);
  console.log('Lesson contentType enum:', Lesson.schema.paths.contentType.enumValues);
  console.log('Lesson difficulty enum:', Lesson.schema.paths.difficulty.enumValues);
  console.log('Lesson exercise.validation enum:', ['TESTS', 'OUTPUT', 'NONE']); // From schema definition
  
} catch (error) {
  console.error('Schema compilation error:', error.message);
}

console.log('\n=== Validation Tests Complete ===');
