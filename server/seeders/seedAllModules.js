// seedAllModules.js
const seedModule0 = require("./seedModule0");
const seedModules1to5 = require("./seedModules1-5");
const seedModules6to10 = require("./seedModules6-10");
const seedModules11to15 = require("./seedModules11-15");
const seedModules16to20 = require("./seedModules16-20");

const seedAllModules = async (
  Lesson,
  Module,
  readContent,
  parseJSONContent,
  seedConfig = {},
) => {
  try {
    console.log("🌱 Starting comprehensive curriculum seeding...");

    // Progress tracking
    let processedBatches = 0;
    const totalBatches = 5; // Changed from 4 to 5

    const updateProgress = () => {
      processedBatches++;
      console.log(
        `📊 Progress: ${processedBatches}/${totalBatches} batches completed`,
      );
    };

    // --- BATCH 0: Module 0 (Tutorial) ---
    console.log("🎮 Seeding Module 0: Tutorial...");
    const module0 = await seedModule0(
      Lesson,
      Module,
      readContent,
      parseJSONContent,
      seedConfig,
    );
    updateProgress();

    // --- BATCH 1: Modules 1-5 (Fundamentals) ---
    console.log("📚 Seeding Batch 1 (Modules 1-5)...");
    const [m1, m2, m3, m4, m5] = await seedModules1to5(
      Lesson,
      Module,
      readContent,
      parseJSONContent,
      {}, // No prerequisites for Batch 1
      seedConfig,
    );
    updateProgress();

    // --- BATCH 2: Modules 6-10 (Intermediate) ---
    console.log("📚 Seeding Batch 2 (Modules 6-10)...");
    const [m6, m7, m8, m9, m10] = await seedModules6to10(
      Lesson,
      Module,
      readContent,
      parseJSONContent,
      { module5_id: m5._id },
      seedConfig,
    );
    updateProgress();

    // --- BATCH 3: Modules 11-15 (Advanced OOP & Tooling) ---
    console.log("📚 Seeding Batch 3 (Modules 11-15)...");
    const [m11, m12, m13, m14, m15] = await seedModules11to15(
      Lesson,
      Module,
      readContent,
      parseJSONContent,
      { module10_id: m10._id },
      seedConfig,
    );
    updateProgress();

    // --- BATCH 4: Modules 16-20 (Data, APIs & Final Projects) ---
    console.log("📚 Seeding Batch 4 (Modules 16-20)...");
    const [m16, m17, m18, m19, m20] = await seedModules16to20(
      Lesson,
      Module,
      readContent,
      parseJSONContent,
      { module15_id: m15._id },
      seedConfig,
    );
    updateProgress();

    console.log("✅ All modules seeded successfully!");

    // Construct the result object
    const result = {
      tutorial: module0,
      fundamentals: [m1, m2, m3, m4, m5],
      intermediate: [m6, m7, m8, m9, m10],
      advanced: [m11, m12, m13, m14, m15],
      projects: [m16, m17, m18, m19, m20],
    };

    // Final database verification
    const moduleCount = await Module.countDocuments();
    const lessonCount = await Lesson.countDocuments();
    console.log(
      `📊 Final Count: ${moduleCount} modules and ${lessonCount} lessons created.`,
    );

    return result;
  } catch (error) {
    console.error("❌ Seeder failed during orchestration:", error);
    throw error;
  }
};

module.exports = seedAllModules;
