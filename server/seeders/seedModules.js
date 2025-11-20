// server/utils/seedModules.js
const mongoose = require("mongoose");
const { getDatabaseUri } = require("../config/envConfig");
const seedAllModules = require("./seedAllModules");
const { readContent, parseJSONContent } = require("./seeders/fileHelpers");

const seedSampleData = async () => {
  try {
    console.log("🌱 Starting data seeding...");

    // Import models inside the function to avoid potential circular dependencies
    const Module = require("../models/Module");
    const Lesson = require("../models/Lesson");

    // Clear existing data
    console.log("🗑️ Clearing existing data...");
    await Module.deleteMany({});
    await Lesson.deleteMany({});

    // Use the new modular seeder
    await seedAllModules(Lesson, Module, readContent, parseJSONContent);

    console.log("✅ Sample data seeded successfully!");
    console.log(
      `📊 Created ${await Module.countDocuments()} modules and ${await Lesson.countDocuments()} lessons`
    );
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
};

const runSeeder = async () => {
  try {
    const MONGODB_URI = getDatabaseUri();
    console.log(`🔗 Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    await seedSampleData();
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
  } catch (error) {
    console.error("❌ Seeder failed:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  runSeeder();
}

module.exports = seedSampleData;
