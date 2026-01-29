const { prepareQuizData, loadLessonAsset } = require("../utils/seederHelpers");

const seedModules11to15 = async (
  Lesson,
  Module,
  readContent,
  parseJSONContent,
  options = {},
  seedConfig = {},
) => {
  console.log("🚀 Seeding Modules 11-15 with config:", {
    batchSize: seedConfig.batchSize,
    modules: seedConfig.modules || "all",
  });

  const { module10_id = null } = options;

  //  ===============================================
  // || MODULE 11: OBJECT-ORIENTED PROGRAMMING (OOP) I ||
  //  ===============================================
  console.log("📘 Creating Module 11: OOP I...");
  const m11Folder = "Module11_OOP1";
  const m11ReviewQuiz = parseJSONContent(m11Folder, "M11_ReviewQuiz.json");
  const module11 = await Module.create({
    title: "Object-Oriented Programming (OOP) I",
    description:
      "Understand the core principles of OOP—Encapsulation, Abstraction, and custom types.",
    shortDescription:
      "Master defining classes, creating objects, and managing attributes.",
    order: 11,
    moduleNumber: "M11",
    difficulty: "intermediate",
    estimatedHours: 3.5,
    isPublished: true,
    prerequisites: module10_id ? [module10_id] : [],
    learningObjectives: [
      "Define classes/instances",
      "Constructor __init__",
      "Encapsulation basics",
    ],
    icon: "🧱",
    xpReward: 250,
    moduleQuiz: prepareQuizData(m11ReviewQuiz),
  });

  const m11Lessons = [
    {
      file: "L1_Classes_Objects.md",
      quiz: "L1_Quiz.json",
      title: "Classes, Objects, and Instantiation",
      type: "exercise",
      ex: "L1_Exercise.json",
    },
    {
      file: "L2_Init_Attributes.md",
      quiz: "L2_Quiz.json",
      title: "The __init__ Constructor and Attributes",
      type: "exercise",
      ex: "L2_Exercise.json",
    },
    {
      file: "L3_Methods_Encapsulation.md",
      quiz: "L3_Quiz.json",
      title: "Instance Methods and Encapsulation",
      type: "exercise",
      ex: "L3_Exercise.json",
    },
    {
      file: "L4_Class_Static.md",
      quiz: "L4_Quiz.json",
      title: "Class Variables and Static Methods",
      type: "exercise",
      ex: "L4_Exercise.json",
    },
    {
      file: "L5_Project_Game_Character.md",
      title: "Project: Building a Game Character Class",
      type: "project",
      ex: "L5_Exercise.json",
    },
  ];

  for (let i = 0; i < m11Lessons.length; i++) {
    const l = m11Lessons[i];
    await Lesson.create({
      title: l.title,
      content: readContent(m11Folder, l.file),
      order: i + 1,
      moduleId: module11._id,
      contentType: l.type,
      quiz: loadLessonAsset(parseJSONContent, m11Folder, l.quiz, "quiz"),
      exercise: loadLessonAsset(parseJSONContent, m11Folder, l.ex, "exercise"),
      isPublished: true,
    });
  }

  //  ===============================================
  // || MODULE 12: OOP II: INHERITANCE & POLYMORPHISM ||
  //  ===============================================
  console.log("📘 Creating Module 12: OOP II...");
  const m12Folder = "Module12_OOP2";
  const m12ReviewQuiz = parseJSONContent(m12Folder, "M12_ReviewQuiz.json");
  const module12 = await Module.create({
    title: "OOP II: Inheritance & Polymorphism",
    description:
      "Advance your OOP skills by implementing relationships between classes.",
    shortDescription:
      "Learn to extend classes, use super(), and implement method overriding.",
    order: 12,
    moduleNumber: "M12",
    difficulty: "intermediate",
    estimatedHours: 3.5,
    isPublished: true,
    prerequisites: [module11._id],
    learningObjectives: [
      "Inheritance",
      "super() keyword",
      "Method Overriding",
      "Polymorphism",
    ],
    icon: "🔗",
    xpReward: 250,
    moduleQuiz: prepareQuizData(m12ReviewQuiz),
  });

  const m12Lessons = [
    {
      file: "L1_Inheritance_Basics.md",
      quiz: "L1_Quiz.json",
      title: "Introduction to Inheritance",
      type: "exercise",
      ex: "L1_Exercise.json",
    },
    {
      file: "L2_Super_Keyword.md",
      quiz: "L2_Quiz.json",
      title: "Calling Parent Methods with super()",
      type: "exercise",
      ex: "L2_Exercise.json",
    },
    {
      file: "L3_Overriding_Polymorphism.md",
      quiz: "L3_Quiz.json",
      title: "Method Overriding and Polymorphism",
      type: "exercise",
      ex: "L3_Exercise.json",
    },
    {
      file: "L4_ABCs.md",
      quiz: "L4_Quiz.json",
      title: "Abstract Base Classes (ABCs)",
      type: "exercise",
      ex: "L4_Exercise.json",
    },
    {
      file: "L5_Project_Shape_Hierarchy.md",
      title: "Project: Building a Shape Hierarchy",
      type: "project",
      ex: "L5_Exercise.json",
    },
  ];

  for (let i = 0; i < m12Lessons.length; i++) {
    const l = m12Lessons[i];
    await Lesson.create({
      title: l.title,
      content: readContent(m12Folder, l.file),
      order: i + 1,
      moduleId: module12._id,
      contentType: l.type,
      quiz: loadLessonAsset(parseJSONContent, m12Folder, l.quiz, "quiz"),
      exercise: loadLessonAsset(parseJSONContent, m12Folder, l.ex, "exercise"),
      isPublished: true,
    });
  }

  //  =======================================
  // || MODULE 13: WORKING WITH DATES & TIME ||
  //  =======================================
  console.log("📘 Creating Module 13: Dates & Time...");
  const m13Folder = "Module13_Datetime";
  const m13ReviewQuiz = parseJSONContent(m13Folder, "M13_ReviewQuiz.json");
  const module13 = await Module.create({
    title: "Working with Dates & Time",
    description:
      "Learn to handle and manipulate date, time, and timezone information.",
    shortDescription:
      "Master creating, formatting, and comparing datetime objects.",
    order: 13,
    moduleNumber: "M13",
    difficulty: "intermediate",
    estimatedHours: 2.5,
    isPublished: true,
    prerequisites: [module12._id],
    learningObjectives: [
      "datetime and timedelta",
      "Formatting with strftime",
      "Parsing with strptime",
      "Timezones",
    ],
    icon: "⏰",
    xpReward: 190,
    moduleQuiz: prepareQuizData(m13ReviewQuiz),
  });

  const m13Lessons = [
    {
      file: "L1_Datetime_Basics.md",
      quiz: "L1_Quiz.json",
      title: "The datetime Module",
      type: "exercise",
      ex: "L1_Exercise.json",
    },
    {
      file: "L2_Formatting_Parsing.md",
      quiz: "L2_Quiz.json",
      title: "Formatting and Parsing",
      type: "exercise",
      ex: "L2_Exercise.json",
    },
    {
      file: "L3_Timedelta.md",
      quiz: "L3_Quiz.json",
      title: "Date Arithmetic with timedelta",
      type: "exercise",
      ex: "L3_Exercise.json",
    },
    {
      file: "L4_Timezones.md",
      quiz: "L4_Quiz.json",
      title: "Time Zones and Conversion",
      type: "exercise",
      ex: "L4_Exercise.json",
    },
    {
      file: "L5_Project_Event_Timer.md",
      title: "Project: Event Timer and Date Validator",
      type: "project",
      ex: "L5_Exercise.json",
    },
  ];

  for (let i = 0; i < m13Lessons.length; i++) {
    const l = m13Lessons[i];
    await Lesson.create({
      title: l.title,
      content: readContent(m13Folder, l.file),
      order: i + 1,
      moduleId: module13._id,
      contentType: l.type,
      quiz: loadLessonAsset(parseJSONContent, m13Folder, l.quiz, "quiz"),
      exercise: loadLessonAsset(parseJSONContent, m13Folder, l.ex, "exercise"),
      isPublished: true,
    });
  }

  //  =======================================
  // || MODULE 14: REGULAR EXPRESSIONS (REGEX) ||
  //  =======================================
  console.log("📘 Creating Module 14: Regular Expressions...");
  const m14Folder = "Module14_Regex";
  const m14ReviewQuiz = parseJSONContent(m14Folder, "M14_ReviewQuiz.json");
  const module14 = await Module.create({
    title: "Regular Expressions (Regex)",
    description: "Learn powerful pattern matching and substitution in strings.",
    shortDescription: "Master the re module for complex text manipulation.",
    order: 14,
    moduleNumber: "M14",
    difficulty: "intermediate",
    estimatedHours: 3.0,
    isPublished: true,
    prerequisites: [module13._id],
    learningObjectives: [
      "Regex syntax",
      "re.search and re.match",
      "Capturing groups",
      "re.sub Substitution",
    ],
    icon: "🔎",
    xpReward: 220,
    moduleQuiz: prepareQuizData(m14ReviewQuiz),
  });

  const m14Lessons = [
    {
      file: "L1_Regex_Basics.md",
      quiz: "L1_Quiz.json",
      title: "Introduction to Regex Syntax",
      type: "exercise",
      ex: "L1_Exercise.json",
    },
    {
      file: "L2_Advanced_Patterns.md",
      quiz: "L2_Quiz.json",
      title: "Quantifiers and Anchors",
      type: "exercise",
      ex: "L2_Exercise.json",
    },
    {
      file: "L3_Capturing_Groups.md",
      quiz: "L3_Quiz.json",
      title: "Capturing Groups",
      type: "exercise",
      ex: "L3_Exercise.json",
    },
    {
      file: "L4_Sub_Split.md",
      quiz: "L4_Quiz.json",
      title: "Substitution and Splitting",
      type: "exercise",
      ex: "L4_Exercise.json",
    },
    {
      file: "L5_Project_Log_Analyzer.md",
      title: "Project: Log File Analyzer",
      type: "project",
      ex: "L5_Exercise.json",
    },
  ];

  for (let i = 0; i < m14Lessons.length; i++) {
    const l = m14Lessons[i];
    await Lesson.create({
      title: l.title,
      content: readContent(m14Folder, l.file),
      order: i + 1,
      moduleId: module14._id,
      contentType: l.type,
      quiz: loadLessonAsset(parseJSONContent, m14Folder, l.quiz, "quiz"),
      exercise: loadLessonAsset(parseJSONContent, m14Folder, l.ex, "exercise"),
      isPublished: true,
    });
  }

  //  =======================================
  // || MODULE 15: PYTHON TOOLING & ENVIRONMENT ||
  //  =======================================
  console.log("📘 Creating Module 15: Python Tooling...");
  const m15Folder = "Module15_Tooling";
  const m15ReviewQuiz = parseJSONContent(m15Folder, "M15_ReviewQuiz.json");
  const module15 = await Module.create({
    title: "Python Tooling & Environment",
    description:
      "Learn professional skills like managing dependencies and virtual environments.",
    shortDescription: "Master pip, venv, and fundamental debugging with pdb.",
    order: 15,
    moduleNumber: "M15",
    difficulty: "intermediate",
    estimatedHours: 2.0,
    isPublished: true,
    prerequisites: [module14._id],
    learningObjectives: [
      "Virtual Environments (venv)",
      "Pip & requirements.txt",
      "Debugging with PDB",
    ],
    icon: "⚙️",
    xpReward: 160,
    moduleQuiz: prepareQuizData(m15ReviewQuiz),
  });

  const m15Lessons = [
    {
      file: "L1_Virtual_Environments.md",
      quiz: "L1_Quiz.json",
      title: "Virtual Environments: venv",
      type: "guided-setup",
      ex: "L1_Exercise.json",
    },
    {
      file: "L2_Pip_Requirements.md",
      quiz: "L2_Quiz.json",
      title: "Package Management with pip",
      type: "exercise",
      ex: "L2_Exercise.json",
    },
    {
      file: "L3_Debugging_PDB.md",
      quiz: "L3_Quiz.json",
      title: "Basic Debugging with pdb",
      type: "exercise",
      ex: "L3_Exercise.json",
    },
    {
      file: "L4_Project_Package_Setup.md",
      title: "Project: Package Setup and Use",
      type: "project",
      ex: "L4_Exercise.json",
    },
  ];

  for (let i = 0; i < m15Lessons.length; i++) {
    const l = m15Lessons[i];
    await Lesson.create({
      title: l.title,
      content: readContent(m15Folder, l.file),
      order: i + 1,
      moduleId: module15._id,
      contentType: l.type,
      quiz: loadLessonAsset(parseJSONContent, m15Folder, l.quiz, "quiz"),
      exercise: loadLessonAsset(parseJSONContent, m15Folder, l.ex, "exercise"),
      isPublished: true,
    });
  }

  console.log("🎉 Modules 11-15 seeding completed!");
  return [module11, module12, module13, module14, module15];
};

module.exports = seedModules11to15;
