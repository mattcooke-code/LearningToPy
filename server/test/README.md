# Integration Tests

This directory contains integration tests for the LearningToPy backend services using an in-memory MongoDB instance.

## Setup

### 1. Install Dependencies

```bash
cd server
npm install --save-dev mongodb-memory-server
```

### 2. Test Structure

```
server/test/
├── helpers/
│   └── db.js              # Database helper for in-memory MongoDB
├── fixtures/
│   └── data.js            # Test data fixtures
├── setup.js               # Global test setup
└── README.md              # This file
```

### 3. Configuration

The `vitest.config.js` is configured to:
- Include both unit tests (`*.test.js`) and integration tests (`*.integration.test.js`)
- Use a global setup file (`test/setup.js`)
- Run with Node environment
- 10 second timeout for tests

## Running Tests

### Run All Tests
```bash
cd server
npx vitest run
```

### Run Only Unit Tests
```bash
cd server
npx vitest run --exclude "*.integration.test.js"
```

### Run Only Integration Tests
```bash
cd server
npx vitest run --include "*.integration.test.js"
```

### Run in Watch Mode
```bash
cd server
npx vitest
```

## Test Files

### Unit Tests
- `services/__tests__/learningEngine.test.js` - Pure function tests with mocks

### Integration Tests
- `services/__tests__/learningEngine.integration.test.js` - Database integration tests
- `services/__tests__/gamification.integration.test.js` - Badge system tests
- `services/__tests__/streakManager.integration.test.js` - Streak tracking tests

## Database Helper

The `test/helpers/db.js` provides:
- `connectDB()` - Start in-memory MongoDB and connect Mongoose
- `clearDatabase()` - Clear all collections between tests
- `disconnectDB()` - Cleanup after tests
- `getMongoUri()` - Get current MongoDB URI (debugging)

## Test Fixtures

The `test/fixtures/data.js` provides:
- `createFixtures()` - Create complete test dataset (modules, lessons, user)
- `createFreshUser()` - Create a new user with default values

Fixtures include:
- 3 modules (orders 1, 5, 20 - Module 20 has no quiz)
- 2-3 lessons per module with different content types
- A user with some completed lessons

## Writing New Integration Tests

1. Import the database helper:
```javascript
import { clearDatabase } from '../../test/helpers/db';
```

2. Use fixtures or create fresh data:
```javascript
import { createFixtures, createFreshUser } from '../../test/fixtures/data';
```

3. Set up and tear down:
```javascript
beforeEach(async () => {
  await clearDatabase();
  fixtures = await createFixtures();
});

afterEach(async () => {
  await clearDatabase();
});
```

4. Test real database operations:
```javascript
it('should save user to database', async () => {
  const user = await createFreshUser();
  const found = await User.findById(user._id);
  expect(found).toBeDefined();
  expect(found.username).toBe(user.username);
});
```

## Notes

- Integration tests use real MongoDB operations, not mocks
- Each test runs in isolation with a clean database
- The in-memory MongoDB is started once before all tests and stopped after
- Unit tests with mocks continue to work alongside integration tests
- Tests run significantly slower than unit tests due to database operations
