// server/utils/seeders/seedAllModules.js
const seedModules1to5 = require("./seedModules1-5");
// You'll add these as you create them:
// const seedModules6to10 = require('./seedModules6-10');
// const seedModules11to15 = require('./seedModules11-15');
// const seedModules16to20 = require('./seedModules16-20');

const seedAllModules = async (
  Lesson,
  Module,
  readContent,
  parseJSONContent
) => {
  try {
    console.log("🌱 Starting comprehensive curriculum seeding...");

    // Clear existing data
    console.log("🗑️ Clearing existing data...");
    await Module.deleteMany({});
    await Lesson.deleteMany({});

    // Seed in logical order
    console.log("📚 Seeding Modules 1-5: Fundamentals...");
    const modules1to5 = await seedModules1to5(
      Lesson,
      Module,
      readContent,
      parseJSONContent
    );

    // console.log("📚 Seeding Modules 6-10: Intermediate...");
    // const modules6to10 = await seedModules6to10(Lesson, Module, readContent, parseJSONContent);

    // console.log("📚 Seeding Modules 11-15: Advanced...");
    // const modules11to15 = await seedModules11to15(Lesson, Module, readContent, parseJSONContent);

    // console.log("📚 Seeding Modules 16-20: Projects...");
    // const modules16to20 = await seedModules16to20(Lesson, Module, readContent, parseJSONContent);

    console.log("✅ All modules seeded successfully!");
    console.log(
      `📊 Created ${await Module.countDocuments()} modules and ${await Lesson.countDocuments()} lessons`
    );

    return {
      modules1to5,
      // modules6to10,
      // modules11to15,
      // modules16to20
    };
  } catch (error) {
    console.error("❌ Seeder failed:", error);
    throw error;
  }
};

module.exports = seedAllModules;
