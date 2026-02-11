// server/seeders/seedModules1-5.js
const { prepareQuizData, loadLessonAsset } = require("../utils/seederHelpers");
const { MODULE_CONFIGS, MODULE_HELPERS } = require("../config/moduleConfigs");

const seedModules1to5 = async (
  Lesson,
  Module,
  readContent,
  parseJSONContent,
  seedConfig = {},
) => {
  console.log("🚀 Seeding Modules 1-5 with config:", {
    batchSize: seedConfig.batchSize,
    modules: seedConfig.modules || "all",
  });

  const createdModules = [];

  // Define which modules to seed (1-5)
  const modulesToSeed = ["M1", "M2", "M3", "M4", "M5"];

  for (const moduleNum of modulesToSeed) {
    const moduleConfig = MODULE_CONFIGS[moduleNum];
    if (!moduleConfig) {
      console.warn(`⚠️ Module ${moduleNum} not found in config, skipping...`);
      continue;
    }

    console.log(`📘 Creating ${moduleNum}: ${moduleConfig.title}...`);

    // Get review quiz
    const reviewQuiz = parseJSONContent(
      moduleConfig.folder,
      `${moduleNum}_ReviewQuiz.json`,
    );

    // Get metadata
    const metadata = MODULE_HELPERS.getModuleMetadata(moduleNum);
    const learningObjectives = MODULE_HELPERS.getLearningObjectives(moduleNum);

    // Build prerequisites (except for M1)
    const prerequisites = [];
    if (moduleNum !== "M1") {
      const prevModuleNum = `M${parseInt(moduleNum.slice(1)) - 1}`;
      const prevModule = createdModules.find(
        (m) => m.moduleNumber === prevModuleNum,
      );
      if (prevModule) {
        prerequisites.push(prevModule._id);
      }
    }

    // Create module
    const module = await Module.create({
      title: moduleConfig.title,
      description: moduleConfig.description,
      shortDescription: moduleConfig.description.substring(0, 100) + "...",
      order: parseInt(moduleNum.slice(1)),
      moduleNumber: moduleNum,
      difficulty: metadata.difficulty,
      estimatedHours: metadata.estimatedHours,
      isPublished: true,
      prerequisites: prerequisites,
      learningObjectives: learningObjectives,
      icon: metadata.icon,
      xpReward: metadata.xpReward,
      moduleQuiz: reviewQuiz ? prepareQuizData(reviewQuiz, true) : null,
    });

    createdModules.push(module);

    // Create lessons
    for (let i = 0; i < moduleConfig.lessons.length; i++) {
      const lessonConfig = moduleConfig.lessons[i];
      await Lesson.create({
        title: lessonConfig.title,
        content: readContent(moduleConfig.folder, lessonConfig.file),
        order: i + 1,
        moduleId: module._id,
        contentType: lessonConfig.type,
        quiz: loadLessonAsset(
          parseJSONContent,
          moduleConfig.folder,
          lessonConfig.quiz,
          "quiz",
        ),
        exercise: loadLessonAsset(
          parseJSONContent,
          moduleConfig.folder,
          lessonConfig.ex,
          "exercise",
        ),
        isPublished: true,
      });
    }

    console.log(
      `✅ ${moduleNum} created with ${moduleConfig.lessons.length} lessons`,
    );
  }

  console.log("🎉 Seeding 1-5 complete!");
  return createdModules;
};

module.exports = seedModules1to5;
