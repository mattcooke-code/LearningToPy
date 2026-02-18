// server/seeders/seedModule0.js
const { prepareQuizData, loadLessonAsset } = require("../utils/seederHelpers");
const { MODULE_CONFIGS, MODULE_HELPERS } = require("../config/moduleConfig");

const seedModule0 = async (Lesson, Module, readContent, parseJSONContent) => {
  const config = MODULE_CONFIGS["M0"];
  if (!config) {
    throw new Error("Module M0 configuration not found");
  }

  console.log(`📘 Creating Module 0: ${config.title}...`);

  const m0ReviewQuiz = parseJSONContent(config.folder, "M0_ReviewQuiz.json");

  // Custom metadata for M0 (tutorial module)
  const module0 = await Module.create({
    title: config.title,
    description: config.description,
    shortDescription: "Platform introduction and navigation guide",
    order: 0,
    moduleNumber: "M0",
    difficulty: "beginner",
    estimatedHours: 0.5,
    isPublished: true,
    learningObjectives: [
      "Navigate the learning platform",
      "Use the code editor effectively",
      "Run Python code in the terminal",
    ],
    icon: "🎮",
    xpReward: 50,
    moduleQuiz: prepareQuizData(m0ReviewQuiz, true),
  });

  for (let i = 0; i < config.lessons.length; i++) {
    const lesson = config.lessons[i];

    const lessonData = {
      title: lesson.title,
      content: readContent(config.folder, lesson.file),
      order: i + 1,
      moduleId: module0._id,
      contentType: lesson.type,
      isPublished: true,
      // XP rewards for tutorial lessons
      xpReward: lesson.type === "exercise" ? 25 : 5,
    };

    if (lesson.quiz) {
      lessonData.quiz = loadLessonAsset(
        parseJSONContent,
        config.folder,
        lesson.quiz,
        "quiz",
      );
    }

    if (lesson.ex) {
      lessonData.exercise = loadLessonAsset(
        parseJSONContent,
        config.folder,
        lesson.ex,
        "exercise",
      );
    }

    await Lesson.create(lessonData);
  }

  console.log(`✅ Module 0 created with ${config.lessons.length} lessons`);
  return module0;
};

module.exports = seedModule0;
