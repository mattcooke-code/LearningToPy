const { prepareQuizData, loadLessonAsset } = require("../utils/seederHelpers");

const seedModule0 = async (
  Lesson,
  Module,
  readContent,
  parseJSONContent,
  seedConfig = {}
) => {
  console.log("📘 Creating Module 0: Getting Started Tutorial...");

  const m0Folder = "Module0_Tutorial";

  let m0ReviewQuiz;
  try {
    m0ReviewQuiz = parseJSONContent(m0Folder, "M0_ReviewQuiz.json");
  } catch (err) {
    console.log("⚠️ No module quiz found for Module 0, continuing without it.");
    m0ReviewQuiz = null;
  }

  const module0 = await Module.create({
    title: "Getting Started Tutorial",
    description:
      "Learn how to use this learning platform and get familiar with the coding environment.",
    shortDescription: "Platform introduction and navigation guide",
    order: 0,
    difficulty: "beginner",
    estimatedHours: 0.5,
    isPublished: true,
    prerequisites: [],
    learningObjectives: [
      "Navigate the learning platform",
      "Use the code editor effectively",
      "Run Python code in the terminal",
      "Understand progress tracking",
      "Use keyboard shortcuts",
      "Complete your first simple exercise",
    ],
    icon: "🎮",
    xpReward: 50,
    // Only add moduleQuiz if it exists
    ...(m0ReviewQuiz && { moduleQuiz: prepareQuizData(m0ReviewQuiz) }),
  });

  // Define lessons in order
  const m0Lessons = [
    {
      file: "L1_Welcome.md",
      quiz: "L1_Quiz.json",
      title: "Welcome to Python Learning!",
      type: "theory",
    },
    {
      file: "L2_Code_Editor.md",
      quiz: "L2_Quiz.json",
      title: "The Code Editor",
      type: "theory",
    },
    {
      file: "L3_Python_Terminal.md",
      quiz: "L3_Quiz.json",
      title: "The Python Terminal",
      type: "theory",
    },
    {
      file: "L4_Running_Code.md",
      quiz: "L4_Quiz.json",
      title: "Running Your Code",
      type: "theory",
    },
    {
      file: "L5_Navigation.md",
      quiz: "L5_Quiz.json",
      title: "Navigation & Progress",
      type: "theory",
    },
    {
      file: "L6_Keyboard_Shortcuts.md",
      quiz: "L6_Quiz.json",
      title: "Keyboard Shortcuts",
      type: "theory",
    },
    {
      file: "L7_First_Exercise.md",
      title: "Your First Python Program",
      type: "exercise",
      ex: "L7_Exercise.json",
    },
  ];

  // Create lessons
  for (let i = 0; i < m0Lessons.length; i++) {
    const lesson = m0Lessons[i];

    const lessonData = {
      title: lesson.title,
      content: readContent(m0Folder, lesson.file),
      order: i + 1,
      moduleId: module0._id,
      contentType: lesson.type,
      isPublished: true,
      xpReward: lesson.type === "exercise" ? 25 : 5,
    };

    // Add quiz if exists
    if (lesson.quiz) {
      try {
        lessonData.quiz = loadLessonAsset(
          parseJSONContent,
          m0Folder,
          lesson.quiz,
          "quiz"
        );
      } catch (error) {
        console.log(`⚠️ No quiz found for ${lesson.title}: ${lesson.quiz}`);
      }
    }

    // Add exercise if exists
    if (lesson.ex) {
      try {
        lessonData.exercise = loadLessonAsset(
          parseJSONContent,
          m0Folder,
          lesson.ex,
          "exercise"
        );
      } catch (error) {
        console.log(`⚠️ No exercise found for ${lesson.title}: ${lesson.ex}`);
      }
    }

    await Lesson.create(lessonData);
  }

  console.log(`✅ Module 0 created with ${m0Lessons.length} lessons!`);
  return module0;
};

module.exports = seedModule0;
