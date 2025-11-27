// server/seeders/seedDatabase.js
const mongoose = require("mongoose");
const {
  getDatabaseUri,
  getSeedConfig,
  isProduction,
} = require("../config/envConfig");

const seedDatabase = async () => {
  const seedConfig = getSeedConfig();

  try {
    // Import models
    const Module = require("../models/Module");
    const Lesson = require("../models/Lesson");
    const seedAllModules = require("./seedAllModules");
    const { readContent, parseJSONContent } = require("./fileHelpers");

    // Connect to MongoDB with seeding optimizations
    const MONGODB_URI = getDatabaseUri();
    console.log(`🔗 Connecting to MongoDB...`);
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 1, // Reduce connection pool for seeding
      socketTimeoutMS: 30000,
      bufferCommands: false,
    });
    console.log("✅ Connected to MongoDB");

    // Dry run mode - just validate, don't execute
    if (seedConfig.dryRun) {
      console.log("🔍 DRY RUN MODE - Validating configuration only");
      console.log("📋 Would seed modules:", seedConfig.modules || "all");
      console.log("🗑️ Would clear data:", seedConfig.clearData);
      console.log("🔢 Batch size:", seedConfig.batchSize);
      await mongoose.connection.close();
      return;
    }

    // Clear existing data based on config
    if (seedConfig.clearData) {
      console.log("🧹 Clearing existing curriculum data...");
      await Module.deleteMany({});
      await Lesson.deleteMany({});
      console.log("✅ Existing data cleared");
    } else {
      console.log("⚠️ Preserving existing data (adding new modules)");
    }

    // Seed modules with configuration
    console.log("🌱 Starting curriculum seeding...");
    console.log(`⚙️ Configuration: ${seedConfig.batchSize} batch size`);

    const allModules = await seedAllModules(
      Lesson,
      Module,
      readContent,
      parseJSONContent,
      seedConfig // Pass the full config
    );

    // Verification and success reporting
    console.log("🔍 Verifying seeding results...");
    const { moduleCount, lessonCount } = await verifySeeding(Module, Lesson);

    console.log("🎉 Database seeding completed successfully!");
    console.log(`📊 Total: ${moduleCount} modules, ${lessonCount} lessons`);

    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  }
};

// Verification function
const verifySeeding = async (Module, Lesson) => {
  const moduleCount = await Module.countDocuments();
  const lessonCount = await Lesson.countDocuments();

  console.log(
    `✅ Verification: ${moduleCount} modules, ${lessonCount} lessons`
  );

  if (moduleCount === 0 || lessonCount === 0) {
    throw new Error("Seeding verification failed - no data found");
  }

  return { moduleCount, lessonCount };
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
