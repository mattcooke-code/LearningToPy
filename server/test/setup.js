/**
 * Global test setup file
 * 
 * This runs before all tests and sets up the in-memory database
 * for integration tests. Unit tests that use mocks won't be affected.
 */

const { connectDB, disconnectDB } = require('./helpers/db');

// Setup before all tests
beforeAll(async () => {
  // Only connect to in-memory DB for integration tests
  // Unit tests with mocks should not trigger this
  await connectDB();
});

// Cleanup after all tests
afterAll(async () => {
  await disconnectDB();
});

// Optional: Clear database between each test file
// Uncomment if you want automatic cleanup between test files
// afterEach(async () => {
//   await clearDatabase();
// });
