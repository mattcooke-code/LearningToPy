// server/seeders/seedModules1-5.js
const { prepareQuizData, loadLessonAsset } = require("../utils/seederHelpers");

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

  //  =================================
  // || MODULE 1: PYTHON FUNDAMENTALS ||
  //  =================================
  console.log("📘 Creating Module 1: Python Fundamentals...");
  const m1Folder = "Module1_Fundamentals";
  const m1ReviewQuiz = parseJSONContent(m1Folder, "M1_ReviewQuiz.json");

  const module1 = await Module.create({
    title: "Python Fundamentals",
    description:
      "Learn the basics of Python programming including variables, data types, and basic operations.",
    shortDescription: "Master Python basics and write your first programs",
    order: 1,
    difficulty: "beginner",
    estimatedHours: 3,
    isPublished: true,
    learningObjectives: [
      "Understand Python syntax and basic concepts",
      "Work with variables and data types",
      "Write and run your first Python program",
    ],
    icon: "🐍",
    xpReward: 100,
    moduleQuiz: prepareQuizData(m1ReviewQuiz, true),
  });

  const m1Lessons = [
    {
      file: "L1_Welcome.md",
      quiz: "L1_Quiz.json",
      title: "Welcome to Python",
      type: "theory",
    },
    {
      file: "L2_Syntax_Blueprint.md",
      quiz: "L2_Quiz.json",
      title: "Python Syntax Blueprint",
      type: "exercise",
      ex: "L2_Exercise.json",
    },
    {
      file: "L3_Variables.md",
      quiz: "L3_Quiz.json",
      title: "Variables: The Labelled Box",
      type: "exercise",
      ex: "L3_Exercise.json",
    },
    {
      file: "L4_Data_Types.md",
      quiz: "L4_Quiz.json",
      title: "Basic Data Types",
      type: "exercise",
      ex: "L4_Exercise.json",
    },
    {
      file: "L5_Operators.md",
      quiz: "L5_Quiz.json",
      title: "Operators: Manipulating Data",
      type: "exercise",
      ex: "L5_Exercise.json",
    },
    {
      file: "L6_Project_Calculator.md",
      title: "Module Project: Simple Calculator",
      type: "project",
      ex: "L6_Exercise.json",
    },
  ];

  for (let i = 0; i < m1Lessons.length; i++) {
    const l = m1Lessons[i];
    await Lesson.create({
      title: l.title,
      content: readContent(m1Folder, l.file),
      order: i + 1,
      moduleId: module1._id,
      contentType: l.type,
      quiz: loadLessonAsset(parseJSONContent, m1Folder, l.quiz, "quiz"),
      exercise: loadLessonAsset(parseJSONContent, m1Folder, l.ex, "exercise"),
      isPublished: true,
    });
  }

  //  =============================================
  // || MODULE 2: DATA STRUCTURES: LISTS & TUPLES ||
  //  =============================================
  console.log("📘 Creating Module 2: Data Structures...");
  const m2Folder = "Module2_DataStructures";
  const m2ReviewQuiz = parseJSONContent(m2Folder, "M2_ReviewQuiz.json");

  const module2 = await Module.create({
    title: "Data Structures: Lists & Tuples",
    description:
      "Explore Python's ordered and sequential structures: mutable Lists and immutable Tuples.",
    shortDescription:
      "Master Lists and Tuples for efficient collection and ordering of data.",
    order: 2,
    difficulty: "beginner",
    estimatedHours: 2.5,
    isPublished: true,
    prerequisites: [module1._id],
    learningObjectives: [
      "Understand and use lists and tuples",
      "Differentiate between mutable and immutable",
      "Perform indexing and slicing",
    ],
    icon: "📊",
    xpReward: 150,
    moduleQuiz: prepareQuizData(m2ReviewQuiz, true),
  });

  const m2Lessons = [
    {
      file: "L1_Lists_Indexing.md",
      quiz: "L1_Quiz.json",
      title: "Lists: The Flexible Array",
      type: "exercise",
      ex: "L1_Exercise.json",
    },
    {
      file: "L2_Slicing.md",
      quiz: "L2_Quiz.json",
      title: "The Art of Slicing",
      type: "exercise",
      ex: "L2_Exercise.json",
    },
    {
      file: "L3_Modifying_Lists.md",
      quiz: "L3_Quiz.json",
      title: "Modifying Your Lists",
      type: "exercise",
      ex: "L3_Exercise.json",
    },
    {
      file: "L4_Removing_Data.md",
      quiz: "L4_Quiz.json",
      title: "Removing Data from Lists",
      type: "exercise",
      ex: "L4_Exercise.json",
    },
    {
      file: "L5_Tuples_Immutable.md",
      quiz: "L5_Quiz.json",
      title: "Tuples: The Immutable List",
      type: "theory",
      ex: "L5_Exercise.json",
    },
    {
      file: "L6_Project_Inventory.md",
      title: "Module Project: Inventory Manager",
      type: "project",
      ex: "L6_Exercise.json",
    },
  ];

  for (let i = 0; i < m2Lessons.length; i++) {
    const l = m2Lessons[i];
    await Lesson.create({
      title: l.title,
      content: readContent(m2Folder, l.file),
      order: i + 1,
      moduleId: module2._id,
      contentType: l.type,
      quiz: loadLessonAsset(parseJSONContent, m2Folder, l.quiz, "quiz"),
      exercise: loadLessonAsset(parseJSONContent, m2Folder, l.ex, "exercise"),
      isPublished: true,
    });
  }

  //  ========================================
  // || MODULE 3: CONTROL FLOW: CONDITIONALS ||
  //  ========================================
  console.log("📘 Creating Module 3: Control Flow...");
  const m3Folder = "Module3_ControlFlow";
  const m3ReviewQuiz = parseJSONContent(m3Folder, "M3_ReviewQuiz.json");

  const module3 = await Module.create({
    title: "Control Flow: Conditionals",
    description:
      "Learn how to make decisions in your code using if, elif, and else statements.",
    shortDescription:
      "Master decision-making logic with conditional statements.",
    order: 3,
    difficulty: "beginner",
    estimatedHours: 2,
    isPublished: true,
    prerequisites: [module1._id],
    learningObjectives: [
      "Write conditional logic",
      "Use comparison operators",
      "Logical operators",
    ],
    icon: "🚥",
    xpReward: 120,
    moduleQuiz: prepareQuizData(m3ReviewQuiz, true),
  });

  const m3Lessons = [
    {
      file: "L1_Conditionals.md",
      quiz: "L1_Quiz.json",
      title: "Decisions, Decisions: The if Statement",
      type: "exercise",
      ex: "L1_Exercise.json",
    },
    {
      file: "L2_Operators_Comparison_Logical.md",
      quiz: "L2_Quiz.json",
      title: "Comparison and Logical Operators",
      type: "exercise",
      ex: "L2_Exercise.json",
    },
    {
      file: "L3_Truthiness.md",
      quiz: "L3_Quiz.json",
      title: "Truthiness and Falsiness",
      type: "exercise",
      ex: "L3_Exercise.json",
    },
    {
      file: "L4_Ternary_Operator.md",
      quiz: "L4_Quiz.json",
      title: "The Ternary Operator: One-Line Logic",
      type: "exercise",
      ex: "L4_Exercise.json",
    },
    {
      file: "L5_Membership_Operators.md",
      quiz: "L5_Quiz.json",
      title: "Membership Operators: in and not in",
      type: "exercise",
      ex: "L5_Exercise.json",
    },
    {
      file: "L6_Project_Role_Selector.md",
      title: "Module Project: The Role Selector",
      type: "project",
      ex: "L6_Exercise.json",
    },
  ];

  for (let i = 0; i < m3Lessons.length; i++) {
    const l = m3Lessons[i];
    await Lesson.create({
      title: l.title,
      content: readContent(m3Folder, l.file),
      order: i + 1,
      moduleId: module3._id,
      contentType: l.type,
      quiz: loadLessonAsset(parseJSONContent, m3Folder, l.quiz, "quiz"),
      exercise: loadLessonAsset(parseJSONContent, m3Folder, l.ex, "exercise"),
      isPublished: true,
    });
  }

  //  =======================
  // || MODULE 4: ITERATION ||
  //  =======================
  console.log("📘 Creating Module 4: Iteration...");
  const m4Folder = "Module4_Iteration";
  const m4ReviewQuiz = parseJSONContent(m4Folder, "M4_ReviewQuiz.json");

  const module4 = await Module.create({
    title: "Iteration",
    description:
      "Learn how to automate repetitive tasks using for and while loops.",
    shortDescription: "Master loops, range(), and flow control.",
    order: 4,
    difficulty: "beginner",
    estimatedHours: 2.5,
    isPublished: true,
    prerequisites: [module2._id, module3._id],
    learningObjectives: ["For loops", "While loops", "Break and Continue"],
    icon: "🔁",
    xpReward: 130,
    moduleQuiz: prepareQuizData(m4ReviewQuiz),
  });

  const m4Lessons = [
    {
      file: "L1_For_Loop_Basics.md",
      quiz: "L1_Quiz.json",
      title: "The For Loop: Iterating Over Sequences",
      type: "exercise",
      ex: "L1_Exercise.json",
    },
    {
      file: "L2_Range_Function.md",
      quiz: "L2_Quiz.json",
      title: "The range() Function: Counting and Stepping",
      type: "exercise",
      ex: "L2_Exercise.json",
    },
    {
      file: "L3_While_Loop.md",
      quiz: "L3_Quiz.json",
      title: "The while Loop: Repeating Until a Condition",
      type: "exercise",
      ex: "L3_Exercise.json",
    },
    {
      file: "L4_Break_Continue.md",
      quiz: "L4_Quiz.json",
      title: "Controlling the Flow: break and continue",
      type: "exercise",
      ex: "L4_Exercise.json",
    },
    {
      file: "L5_Nested_Loops.md",
      quiz: "L5_Quiz.json",
      title: "Nested Loops: Working with Grids",
      type: "exercise",
      ex: "L5_Exercise.json",
    },
    {
      file: "L6_Project_Data_Processor.md",
      title: "Module Project: The Data Processor",
      type: "project",
      ex: "L6_Exercise.json",
    },
  ];

  for (let i = 0; i < m4Lessons.length; i++) {
    const l = m4Lessons[i];
    await Lesson.create({
      title: l.title,
      content: readContent(m4Folder, l.file),
      order: i + 1,
      moduleId: module4._id,
      contentType: l.type,
      quiz: loadLessonAsset(parseJSONContent, m4Folder, l.quiz, "quiz"),
      exercise: loadLessonAsset(parseJSONContent, m4Folder, l.ex, "exercise"),
      isPublished: true,
    });
  }

  //  ==================================================
  // || MODULE 5: DATA STRUCTURES: DICTIONARIES & SETS ||
  //  ==================================================
  console.log("📘 Creating Module 5: Dictionaries & Sets...");
  const m5Folder = "Module5_DataStructures";
  const m5ReviewQuiz = parseJSONContent(m5Folder, "M5_ReviewQuiz.json");

  const module5 = await Module.create({
    title: "Data Structures: Dictionaries & Sets",
    description: "Explore unordered data types: Dictionaries and Sets.",
    shortDescription:
      "Master Dictionaries for key-value data and Sets for unique collections.",
    order: 5,
    difficulty: "beginner",
    estimatedHours: 2.5,
    isPublished: true,
    prerequisites: [module2._id],
    learningObjectives: [
      "Dictionary manipulation",
      "Set operations",
      "Choosing the right tool",
    ],
    icon: "📖",
    xpReward: 170,
    moduleQuiz: prepareQuizData(m5ReviewQuiz),
  });

  const m5Lessons = [
    {
      file: "L1_Dict_Basics.md",
      quiz: "L1_Quiz.json",
      title: "Dictionaries: Key-Value Pairs",
      type: "exercise",
      ex: "L1_Exercise.json",
    },
    {
      file: "L2_Dict_Manipulation.md",
      quiz: "L2_Quiz.json",
      title: "Dictionary Methods and Iteration",
      type: "exercise",
      ex: "L2_Exercise.json",
    },
    {
      file: "L3_Sets_Basics.md",
      quiz: "L3_Quiz.json",
      title: "Sets: Unique, Unordered Collections",
      type: "exercise",
      ex: "L3_Exercise.json",
    },
    {
      file: "L4_Set_Operations.md",
      quiz: "L4_Quiz.json",
      title: "Set Operations: Union, Intersection, Difference",
      type: "exercise",
      ex: "L4_Exercise.json",
    },
    {
      file: "L5_Structure_Review.md",
      quiz: "L5_Quiz.json",
      title: "Data Structure Review",
      type: "exercise",
      ex: "L5_Exercise.json",
    },
    {
      file: "L6_Project_Tag_Manager.md",
      title: "Module Project: Inventory and Tag Manager",
      type: "project",
      ex: "L6_Exercise.json",
    },
  ];

  for (let i = 0; i < m5Lessons.length; i++) {
    const l = m5Lessons[i];
    await Lesson.create({
      title: l.title,
      content: readContent(m5Folder, l.file),
      order: i + 1,
      moduleId: module5._id,
      contentType: l.type,
      quiz: loadLessonAsset(parseJSONContent, m5Folder, l.quiz, "quiz"),
      exercise: loadLessonAsset(parseJSONContent, m5Folder, l.ex, "exercise"),
      isPublished: true,
    });
  }

  console.log("🎉 Seeding 1-5 complete!");
  return [module1, module2, module3, module4, module5];
};

module.exports = seedModules1to5;
