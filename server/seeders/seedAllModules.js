// server/seeders/seedAllModules.js
const seedModules1to5 = require("./seedModules1-5");
const seedModules6to10 = require("./seedModules6-10");
const seedModules11to15 = require("./seedModules11-15");
const seedModules16to20 = require("./seedModules16-20");

/**
 * Orchestrates the seeding of the entire curriculum in logical order.
 * Ensures IDs are passed between batches to maintain prerequisite links.
 */
const seedAllModules = async (
  Lesson,
  Module,
  readContent,
  parseJSONContent,
  seedConfig = {}
) => {
  try {
    console.log("🌱 Starting comprehensive curriculum seeding...");

    // Progress tracking
    let processedBatches = 0;
    const totalBatches = 4;

    const updateProgress = () => {
      processedBatches++;
      console.log(
        `📊 Progress: ${processedBatches}/${totalBatches} batches completed`
      );
    };

    // --- BATCH 1: Modules 1-5 (Fundamentals) ---
    console.log("📚 Seeding Batch 1 (Modules 1-5)...");
    const [m1, m2, m3, m4, m5] = await seedModules1to5(
      Lesson,
      Module,
      readContent,
      parseJSONContent,
      {}, // No prerequisites for Batch 1
      seedConfig
    );
    updateProgress();

    // --- BATCH 2: Modules 6-10 (Intermediate) ---
    console.log("📚 Seeding Batch 2 (Modules 6-10)...");
    const [m6, m7, m8, m9, m10] = await seedModules6to10(
      Lesson,
      Module,
      readContent,
      parseJSONContent,
      {
        module1_id: m1._id,
        module4_id: m4._id,
      },
      seedConfig
    );
    updateProgress();

    // --- BATCH 3: Modules 11-15 (Advanced OOP & Tooling) ---
    console.log("📚 Seeding Batch 3 (Modules 11-15)...");
    const [m11, m12, m13, m14, m15] = await seedModules11to15(
      Lesson,
      Module,
      readContent,
      parseJSONContent,
      {
        module10_id: m10._id, // OOP I requires Module 10
        module1_id: m1._id, // Tooling requires Module 1
      },
      seedConfig
    );
    updateProgress();

    // --- BATCH 4: Modules 16-20 (Data, APIs & Final Projects) ---
    console.log("📚 Seeding Batch 4 (Modules 16-20)...");
    const [m16, m17, m18, m19, m20] = await seedModules16to20(
      Lesson,
      Module,
      readContent,
      parseJSONContent,
      {
        module1_id: m1._id,
        module2_id: m2._id,
        module4_id: m4._id,
        module5_id: m5._id,
        module7_id: m7._id,
      },
      seedConfig
    );
    updateProgress();

    console.log("✅ All modules seeded successfully!");

    // Construct the result object for the caller
    const result = {
      fundamentals: [m1, m2, m3, m4, m5],
      intermediate: [m6, m7, m8, m9, m10],
      advanced: [m11, m12, m13, m14, m15],
      projects: [m16, m17, m18, m19, m20],
    };

    // Final database verification
    const moduleCount = await Module.countDocuments();
    const lessonCount = await Lesson.countDocuments();
    console.log(
      `📊 Final Count: ${moduleCount} modules and ${lessonCount} lessons created.`
    );

    return result;
  } catch (error) {
    console.error("❌ Seeder failed during orchestration:", error);
    throw error;
  }
};

module.exports = seedAllModules;
