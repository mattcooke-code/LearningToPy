// server/seeders/seedDatabase.js (IMPROVED VERSION)
const mongoose = require("mongoose");
const {
  getDatabaseUri,
  getSeedConfig,
  isProduction,
} = require("../config/envConfig");

/**
 * Full database seeding with nuclear option
 *
 * This is the "nuke and pave" seeder - it drops everything and rebuilds.
 * Use updateCurriculum.js for selective updates.
 *
 * Usage:
 *   npm run seed                    # Full reseed
 *   npm run seed -- --no-clear      # Add new modules without clearing
 *   npm run seed -- --dry-run       # Validate only
 */
const seedDatabase = async () => {
  const seedConfig = getSeedConfig();

  try {
    // Import models
    const Module = require("../models/Module");
    const Lesson = require("../models/Lesson");
    const User = require("../models/User");
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
      console.log("⚠️  WARNING: This will delete ALL data including users!");

      if (isProduction()) {
        console.log("🛑 PRODUCTION DETECTED - Aborting for safety");
        console.log("💡 Use updateCurriculum.js for production updates");
        process.exit(1);
      }

      // Nuclear option - drop the entire database
      await mongoose.connection.db.dropDatabase();
      console.log("✅ Database cleared (nuclear option executed)");

      // Show what was deleted
      console.log("📊 Deleted: Modules, Lessons, Users, and all related data");
    } else {
      console.log("⚠️ Preserving existing data (adding new modules only)");
      console.log("💡 Tip: Use updateCurriculum.js to update existing modules");
    }

    // Seed modules with configuration
    console.log("🌱 Starting curriculum seeding...");
    console.log(`⚙️ Configuration: ${seedConfig.batchSize} batch size`);

    const allModules = await seedAllModules(
      Lesson,
      Module,
      readContent,
      parseJSONContent,
      seedConfig,
    );

    // Verification and success reporting
    console.log("🔍 Verifying seeding results...");
    const { moduleCount, lessonCount } = await verifySeeding(Module, Lesson);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log(`📊 Total: ${moduleCount} modules, ${lessonCount} lessons`);

    if (seedConfig.clearData) {
      console.log("⚠️  Remember: All user data was cleared");
      console.log("💡 Users will need to register again");
    }

    console.log("\n📚 Next steps:");
    console.log("  - Test the application: npm start");
    console.log("  - Update specific content: npm run update:lesson M1L2");
    console.log("  - Update a module: npm run update:module M3");
    console.log("  - Reset user progress only: npm run reset:users");

    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
};

// Verification function
const verifySeeding = async (Module, Lesson) => {
  const moduleCount = await Module.countDocuments();
  const lessonCount = await Lesson.countDocuments();

  console.log(
    `✅ Verification: ${moduleCount} modules, ${lessonCount} lessons`,
  );

  if (moduleCount === 0 || lessonCount === 0) {
    throw new Error("Seeding verification failed - no data found");
  }

  // Additional integrity checks
  const modulesWithoutLessons = await Module.aggregate([
    {
      $lookup: {
        from: "lessons",
        localField: "_id",
        foreignField: "moduleId",
        as: "lessons",
      },
    },
    {
      $match: {
        "lessons.0": { $exists: false },
      },
    },
  ]);

  if (modulesWithoutLessons.length > 0) {
    console.warn(
      `⚠️  Warning: ${modulesWithoutLessons.length} modules have no lessons`,
    );
    modulesWithoutLessons.forEach((m) => {
      console.warn(`  - ${m.moduleNumber}: ${m.title}`);
    });
  }

  return { moduleCount, lessonCount };
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
