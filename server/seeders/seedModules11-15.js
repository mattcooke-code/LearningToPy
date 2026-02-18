// server/seeders/seedModules11to15.js
const { prepareQuizData, loadLessonAsset } = require("../utils/seederHelpers");
const { MODULE_CONFIGS, MODULE_HELPERS } = require("../config/moduleConfig");

const seedModules11to15 = async (
  Lesson,
  Module,
  readContent,
  parseJSONContent,
  options = {},
) => {
  console.log("🚀 Seeding Modules 11-15...");

  const moduleIds = {};
  const prevModuleId = options.module10_id;

  // Modules to seed (11-15)
  const modulesToSeed = ["M11", "M12", "M13", "M14", "M15"];

  for (const moduleKey of modulesToSeed) {
    const config = MODULE_CONFIGS[moduleKey];
    if (!config) {
      console.warn(`⚠️ Module ${moduleKey} not found in config, skipping...`);
      continue;
    }

    console.log(`📘 Creating ${moduleKey}: ${config.title}...`);

    // Get review quiz
    const reviewQuiz = parseJSONContent(
      config.folder,
      `${moduleKey}_ReviewQuiz.json`,
    );

    // Get metadata from helpers
    const metadata = MODULE_HELPERS.getModuleMetadata(moduleKey);
    const learningObjectives = MODULE_HELPERS.getLearningObjectives(moduleKey);

    // Determine prerequisites
    const prerequisites = [];
    if (moduleKey === "M11" && prevModuleId) {
      prerequisites.push(prevModuleId);
    } else if (moduleKey !== "M11") {
      const prevModuleKey = `M${parseInt(moduleKey.slice(1)) - 1}`;
      const prevModuleId = moduleIds[prevModuleKey];
      if (prevModuleId) {
        prerequisites.push(prevModuleId);
      }
    }

    // Create module
    const moduleDoc = await Module.create({
      title: config.title,
      description: config.description,
      shortDescription: config.description.substring(0, 100) + "...",
      order: parseInt(moduleKey.slice(1)),
      moduleNumber: moduleKey,
      difficulty: metadata.difficulty,
      estimatedHours: metadata.estimatedHours,
      isPublished: true,
      prerequisites,
      learningObjectives,
      icon: metadata.icon,
      xpReward: metadata.xpReward,
      moduleQuiz: prepareQuizData(reviewQuiz, true),
    });

    moduleIds[moduleKey] = moduleDoc._id;

    // Create lessons
    for (let i = 0; i < config.lessons.length; i++) {
      const lesson = config.lessons[i];
      await Lesson.create({
        title: lesson.title,
        content: readContent(config.folder, lesson.file),
        order: i + 1,
        moduleId: moduleDoc._id,
        contentType: lesson.type,
        quiz: lesson.quiz
          ? loadLessonAsset(
              parseJSONContent,
              config.folder,
              lesson.quiz,
              "quiz",
            )
          : null,
        exercise: lesson.ex
          ? loadLessonAsset(
              parseJSONContent,
              config.folder,
              lesson.ex,
              "exercise",
            )
          : null,
        isPublished: true,
      });
    }

    console.log(
      `✅ ${moduleKey} created with ${config.lessons.length} lessons`,
    );
  }

  console.log("🎉 Seeding 11-15 complete!");
  return Object.values(moduleIds);
};

module.exports = seedModules11to15;
