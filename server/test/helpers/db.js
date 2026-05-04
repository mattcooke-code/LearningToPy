/**
 * Database helper for integration tests
 * Uses the local MongoDB instance with a separate test database.
 */

const mongoose = require('mongoose');

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/learning-to-py-test';

const connectDB = async () => {
  if (mongoose.connection.readyState !== 0) return;
  await mongoose.connect(TEST_DB_URI);
  console.log('🔗 Connected to test database');
};

const clearDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
  console.log('🔌 Disconnected from test database');
};

module.exports = { connectDB, clearDatabase, disconnectDB };