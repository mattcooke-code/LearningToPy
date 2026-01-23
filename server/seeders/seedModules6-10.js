// server/seeders/seedModules6-10.js
const { prepareQuizData, loadLessonAsset } = require("../utils/seederHelpers");

const seedModules6to10 = async (
  Lesson,
  Module,
  readContent,
  parseJSONContent,
  options = {},
  seedConfig = {},
) => {
  console.log("🚀 Seeding Modules 6-10 with config:", {
    batchSize: seedConfig.batchSize,
    modules: seedConfig.modules || "all",
  });

  const { module5_id = null } = options;

  //  =======================
  // || MODULE 6: FUNCTIONS ||
  //  =======================
  console.log("📘 Creating Module 6: Functions...");
  const m6Folder = "Module6_Functions";
  const m6ReviewQuiz = parseJSONContent(m6Folder, "M6_ReviewQuiz.json");

  const module6 = await Module.create({
    title: "Functions",
    description:
      "Learn how to break code into reusable blocks, manage parameters, and control scope.",
    shortDescription:
      "Master defining, calling, and returning values from functions.",
    order: 6,
    difficulty: "beginner",
    estimatedHours: 2,
    isPublished: true,
    prerequisites: module5_id ? [module5_id] : [],
    learningObjectives: [
      "Define functions using def",
      "Understand scope",
      "Use positional and keyword arguments",
    ],
    icon: "🛠️",
    xpReward: 200,
    moduleQuiz: prepareQuizData(m6ReviewQuiz),
  });

  const m6Lessons = [
    {
      file: "L1_Function_Basics.md",
      quiz: "L1_Quiz.json",
      title: "Defining and Calling Functions",
      type: "exercise",
      ex: "L1_Exercise.json",
    },
    {
      file: "L2_Argument_Passing.md",
      quiz: "L2_Quiz.json",
      title: "Argument Passing: Positional and Keyword",
      type: "exercise",
      ex: "L2_Exercise.json",
    },
    {
      file: "L3_Variable_Scope.md",
      quiz: "L3_Quiz.json",
      title: "Scope: Local vs. Global Variables",
      type: "exercise",
      ex: "L3_Exercise.json",
    },
    {
      file: "L4_Practical_Functions.md",
      quiz: "L4_Quiz.json",
      title: "Practical Functions Practice",
      type: "exercise",
      ex: "L4_Exercise.json",
    },
    {
      file: "L5_Project_Calculator_Builder.md",
      title: "Module Project: Calculator Builder",
      type: "project",
      ex: "L5_Exercise.json",
    },
  ];

  for (let i = 0; i < m6Lessons.length; i++) {
    const l = m6Lessons[i];
    await Lesson.create({
      title: l.title,
      content: readContent(m6Folder, l.file),
      order: i + 1,
      moduleId: module6._id,
      contentType: l.type,
      quiz: loadLessonAsset(parseJSONContent, m6Folder, l.quiz, "quiz"),
      exercise: loadLessonAsset(parseJSONContent, m6Folder, l.ex, "exercise"),
      isPublished: true,
    });
  }

  //  =============================
  // || MODULE 7: FILE I/O BASICS ||
  //  =============================
  console.log("📘 Creating Module 7: File I/O Basics...");
  const m7Folder = "Module7_File_IO";
  const m7ReviewQuiz = parseJSONContent(m7Folder, "M7_ReviewQuiz.json");

  const module7 = await Module.create({
    title: "File I/O Basics",
    description:
      "Master reading from and writing to local files for data processing and persistence.",
    shortDescription:
      "Learn to open, read, write, and safely manage local text files.",
    order: 7,
    difficulty: "beginner",
    estimatedHours: 2.5,
    isPublished: true,
    prerequisites: [module6._id],
    learningObjectives: [
      "Use open() and context managers",
      "File modes (r, w, a)",
      "Read/Write methods",
    ],
    icon: "📁",
    xpReward: 195,
    moduleQuiz: prepareQuizData(m7ReviewQuiz),
  });

  const m7Lessons = [
    {
      file: "L1_Reading_Basics.md",
      quiz: "L1_Quiz.json",
      title: "Reading from Files: The open() function",
      type: "exercise",
      ex: "L1_Exercise.json",
    },
    {
      file: "L2_Reading_Lines.md",
      quiz: "L2_Quiz.json",
      title: "Reading Line by Line",
      type: "exercise",
      ex: "L2_Exercise.json",
    },
    {
      file: "L3_Context_Manager.md",
      quiz: "L3_Quiz.json",
      title: "The with open(...) Context Manager",
      type: "exercise",
      ex: "L3_Exercise.json",
    },
    {
      file: "L4_Writing_To_Files.md",
      quiz: "L4_Quiz.json",
      title: "Writing to Files: The 'w' and 'a' Modes",
      type: "exercise",
      ex: "L4_Exercise.json",
    },
    {
      file: "L5_Project_Log_Processor.md",
      title: "Module Project: Simple Log File Processor",
      type: "project",
      ex: "L5_Exercise.json",
    },
  ];

  for (let i = 0; i < m7Lessons.length; i++) {
    const l = m7Lessons[i];
    await Lesson.create({
      title: l.title,
      content: readContent(m7Folder, l.file),
      order: i + 1,
      moduleId: module7._id,
      contentType: l.type,
      quiz: loadLessonAsset(parseJSONContent, m7Folder, l.quiz, "quiz"),
      exercise: loadLessonAsset(parseJSONContent, m7Folder, l.ex, "exercise"),
      isPublished: true,
    });
  }

  //  ================================
  // || MODULE 8: ERROR HANDLING     ||
  //  ================================
  console.log("📘 Creating Module 8: Error Handling...");
  const m8Folder = "Module8_Error_Handling";
  const m8ReviewQuiz = parseJSONContent(m8Folder, "M8_ReviewQuiz.json");

  const module8 = await Module.create({
    title: "Error Handling: Try/Except",
    description:
      "Learn to write robust Python code that gracefully handles errors without crashing.",
    shortDescription:
      "Master try/except blocks to catch and handle runtime errors safely.",
    order: 8,
    difficulty: "beginner",
    estimatedHours: 2,
    isPublished: true,
    prerequisites: [module7._id],
    learningObjectives: [
      "Try/Except syntax",
      "Handling specific exceptions",
      "Else and Finally",
      "Raising exceptions",
    ],
    icon: "🛡️",
    xpReward: 150,
    moduleQuiz: prepareQuizData(m8ReviewQuiz),
  });

  const m8Lessons = [
    {
      file: "L1_Introduction_Exceptions.md",
      quiz: "L1_Quiz.json",
      title: "Introduction to Exceptions",
      type: "exercise",
      ex: "L1_Exercise.json",
    },
    {
      file: "L2_Specific_Exceptions.md",
      quiz: "L2_Quiz.json",
      title: "Handling Specific Exceptions",
      type: "exercise",
      ex: "L2_Exercise.json",
    },
    {
      file: "L3_Else_Finally.md",
      quiz: "L3_Quiz.json",
      title: "Else and Finally Clauses",
      type: "exercise",
      ex: "L3_Exercise.json",
    },
    {
      file: "L4_Raising_Exceptions.md",
      quiz: "L4_Quiz.json",
      title: "Raising Exceptions",
      type: "exercise",
      ex: "L4_Exercise.json",
    },
    {
      file: "L5_Project_Robust_Processor.md",
      title: "Project: Robust File Processor",
      type: "project",
      ex: "L5_Exercise.json",
    },
  ];

  for (let i = 0; i < m8Lessons.length; i++) {
    const l = m8Lessons[i];
    await Lesson.create({
      title: l.title,
      content: readContent(m8Folder, l.file),
      order: i + 1,
      moduleId: module8._id,
      contentType: l.type,
      quiz: loadLessonAsset(parseJSONContent, m8Folder, l.quiz, "quiz"),
      exercise: loadLessonAsset(parseJSONContent, m8Folder, l.ex, "exercise"),
      isPublished: true,
    });
  }

  //  ====================================
  // || MODULE 9: COMPREHENSIONS       ||
  //  ====================================
  console.log("📘 Creating Module 9: Comprehensions...");
  const m9Folder = "Module9_Comprehensions";
  const m9ReviewQuiz = parseJSONContent(m9Folder, "M9_ReviewQuiz.json");

  const module9 = await Module.create({
    title: "List/Dict Comprehensions",
    description:
      "Master Python's concise syntax for creating lists and dictionaries with elegant one-liners.",
    shortDescription:
      "Learn to create lists and dictionaries efficiently with conditional logic.",
    order: 9,
    difficulty: "intermediate",
    estimatedHours: 2.5,
    isPublished: true,
    prerequisites: [module8._id],
    learningObjectives: [
      "List comprehensions",
      "Dictionary comprehensions",
      "Conditional logic",
      "Nested patterns",
    ],
    icon: "⚡",
    xpReward: 210,
    moduleQuiz: prepareQuizData(m9ReviewQuiz),
  });

  const m9Lessons = [
    {
      file: "L1_List_Comprehensions_Basics.md",
      quiz: "L1_Quiz.json",
      title: "List Comprehensions Basics",
      type: "exercise",
      ex: "L1_Exercise.json",
    },
    {
      file: "L2_Conditional_Comprehensions.md",
      quiz: "L2_Quiz.json",
      title: "Conditional List Comprehensions",
      type: "exercise",
      ex: "L2_Exercise.json",
    },
    {
      file: "L3_Dictionary_Comprehensions.md",
      quiz: "L3_Quiz.json",
      title: "Dictionary Comprehensions",
      type: "exercise",
      ex: "L3_Exercise.json",
    },
    {
      file: "L4_Nested_Comprehensions.md",
      quiz: "L4_Quiz.json",
      title: "Nested Comprehensions",
      type: "exercise",
      ex: "L4_Exercise.json",
    },
    {
      file: "L5_Project_Data_Transformation.md",
      title: "Project: Data Transformation Pipeline",
      type: "project",
      ex: "L5_Exercise.json",
    },
  ];

  for (let i = 0; i < m9Lessons.length; i++) {
    const l = m9Lessons[i];
    await Lesson.create({
      title: l.title,
      content: readContent(m9Folder, l.file),
      order: i + 1,
      moduleId: module9._id,
      contentType: l.type,
      quiz: loadLessonAsset(parseJSONContent, m9Folder, l.quiz, "quiz"),
      exercise: loadLessonAsset(parseJSONContent, m9Folder, l.ex, "exercise"),
      isPublished: true,
    });
  }

  //  =================================
  // || MODULE 10: ADVANCED FUNCTIONS ||
  //  =================================
  console.log("📘 Creating Module 10: Advanced Functions...");
  const m10Folder = "Module10_Advanced_Functions";
  const m10ReviewQuiz = parseJSONContent(m10Folder, "M10_ReviewQuiz.json");

  const module10 = await Module.create({
    title: "Advanced Functions",
    description:
      "Master lambda functions, decorators, flexible arguments, and functional programming.",
    shortDescription:
      "Learn lambda functions, *args/**kwargs, decorators, and functional programming techniques.",
    order: 10,
    difficulty: "intermediate",
    estimatedHours: 3.5,
    isPublished: true,
    prerequisites: [module9._id],
    learningObjectives: [
      "Lambda functions",
      "*args and **kwargs",
      "Decorators",
      "Map/Filter/Reduce",
    ],
    icon: "🎯",
    xpReward: 250,
    moduleQuiz: prepareQuizData(m10ReviewQuiz),
  });

  const m10Lessons = [
    {
      file: "L1_Lambda_Functions.md",
      quiz: "L1_Quiz.json",
      title: "Lambda Functions",
      type: "exercise",
      ex: "L1_Exercise.json",
    },
    {
      file: "L2_Args_Kwargs.md",
      quiz: "L2_Quiz.json",
      title: "*args and **kwargs",
      type: "exercise",
      ex: "L2_Exercise.json",
    },
    {
      file: "L3_Function_Decorators.md",
      quiz: "L3_Quiz.json",
      title: "Function Decorators",
      type: "exercise",
      ex: "L3_Exercise.json",
    },
    {
      file: "L4_Functional_Programming_Tools.md",
      quiz: "L4_Quiz.json",
      title: "Functional Programming Tools",
      type: "exercise",
      ex: "L4_Exercise.json",
    },
    {
      file: "L5_Project_Function_Toolkit.md",
      title: "Project: Advanced Function Toolkit Builder",
      type: "project",
      ex: "L5_Exercise.json",
    },
  ];

  for (let i = 0; i < m10Lessons.length; i++) {
    const l = m10Lessons[i];
    await Lesson.create({
      title: l.title,
      content: readContent(m10Folder, l.file),
      order: i + 1,
      moduleId: module10._id,
      contentType: l.type,
      quiz: loadLessonAsset(parseJSONContent, m10Folder, l.quiz, "quiz"),
      exercise: loadLessonAsset(parseJSONContent, m10Folder, l.ex, "exercise"),
      isPublished: true,
    });
  }

  console.log("🎉 Modules 6-10 seeding completed!");
  return [module6, module7, module8, module9, module10];
};

module.exports = seedModules6to10;
