// server/seeders/seedAllModules.js
const seedModules1to5 = require("./seedModules1-5");
const seedModules6to10 = require("./seedModules6-10");
const seedModules11to15 = require("./seedModules11-15");
const seedModules16to20 = require("./seedModules16-20");

const seedAllModules = async (
  Lesson,
  Module,
  readContent,
  parseJSONContent,
  seedConfig = {}
) => {
  try {
    console.log("🌱 Starting comprehensive curriculum seeding...");
    console.log(`📋 Configuration:`, {
      clearData: seedConfig.clearData,
      batchSize: seedConfig.batchSize,
      modules: seedConfig.modules || "all",
      dryRun: seedConfig.dryRun,
    });

    // Progress tracking
    let processedBatches = 0;
    const totalBatches = 4;

    const updateProgress = () => {
      processedBatches++;
      console.log(
        `📊 Progress: ${processedBatches}/${totalBatches} batches completed`
      );
    };

    // Seed in logical order, passing IDs between batches
    console.log("📚 Seeding Modules 1-5: Fundamentals...");
    const [module1, module2, module3, module4, module5] = await seedModules1to5(
      Lesson,
      Module,
      readContent,
      parseJSONContent,
      seedConfig
    );
    updateProgress();

    console.log("📚 Seeding Modules 6-10: Intermediate...");
    const [module6, module7, module8, module9, module10] =
      await seedModules6to10(Lesson, Module, readContent, parseJSONContent, {
        ...seedConfig,
        module1_id: module1._id,
        module4_id: module4._id,
      });
    updateProgress();

    console.log("📚 Seeding Modules 11-15: Advanced...");
    // Pass actual module IDs to seedModules11to15
    const [module11, module12, module13, module14, module15] =
      await seedModules11to15(Lesson, Module, readContent, parseJSONContent, {
        ...seedConfig,
        module10_id: module10._id,
        module1_id: module1._id,
      });
    updateProgress();

    console.log("📚 Seeding Modules 16-20: Projects...");
    // Pass actual module IDs to seedModules16to20
    const [module16, module17, module18, module19, module20] =
      await seedModules16to20(Lesson, Module, readContent, parseJSONContent, {
        ...seedConfig,
        module2_id: module2._id,
        module4_id: module4._id,
        module5_id: module5._id,
        module7_id: module7._id,
      });
    updateProgress();

    console.log("✅ All modules seeded successfully!");

    const result = {
      modules1to5: { module1, module2, module3, module4, module5 },
      modules6to10: { module6, module7, module8, module9, module10 },
      modules11to15: { module11, module12, module13, module14, module15 },
      modules16to20: { module16, module17, module18, module19, module20 },
    };

    // Final counts
    const moduleCount = await Module.countDocuments();
    const lessonCount = await Lesson.countDocuments();
    console.log(`📊 Created ${moduleCount} modules and ${lessonCount} lessons`);

    return result;
  } catch (error) {
    console.error("❌ Seeder failed:", error);
    throw error;
  }
};

module.exports = seedAllModules;
