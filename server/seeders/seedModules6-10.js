// server/utils/seedModules6-10.js

const seedModules6to10 = async (
  Lesson,
  Module,
  readContent,
  parseJSONContent
) => {
  //  ======================
  // || MODULE 6: FUNCTIONS ||
  //  ======================

  const module6 = await Module.create({
    title: "Functions",
    description:
      "Learn how to break code into reusable, organized blocks using functions, manage parameters, and control scope.",
    shortDescription:
      "Master defining, calling, and returning values from functions.",
    order: 6,
    difficulty: "beginner",
    estimatedHours: 2.5,
    isPublished: true, // NOTE: Prerequisites here should be the IDs returned from the previous seeder block (M3, M4). // For now, we'll leave them as an empty array or use placeholders.
    prerequisites: [], // [module3._id, module4._id]
    learningObjectives: [
      "Define functions using `def` and pass data via parameters.",
      "Differentiate between arguments, parameters, and return values.",
      "Understand scope (local vs. global variables).",
      "Use variable argument lists (`*args`, `**kwargs`).",
    ],
    icon: "🛠️",
    xpReward: 140,
  });

  // --- Lesson 6.1: Defining and Calling Functions (.md + .json files) ---

  const m6L1Content = readContent("Module6_Functions", "L1_Function_Basics.md");
  const m6L1Exercise = parseJSONContent(
    "Module6_Functions",
    "L1_Exercise.json"
  );

  if (!m6L1Content) {
    throw new Error("Failed to read L1_Function_Basics.md");
  }

  await Lesson.create({
    title: "Defining and Calling Functions",
    content: m6L1Content,
    shortDescription:
      "Use the `def` keyword to define functions, pass arguments, and use the `return` statement.",
    order: 1,
    moduleId: module6._id,
    xpReward: 30,
    duration: 15,
    contentType: "exercise",
    exercise: m6L1Exercise,
    isPublished: true,
  });

  // --- Lesson 6.2: Argument Passing: Positional and Keyword (.md + .json files) ---
  const m6L2Content = readContent(
    "Module6_Functions",
    "L2_Argument_Passing.md"
  );
  const m6L2Exercise = parseJSONContent(
    "Module6_Functions",
    "L2_Exercise.json"
  );

  if (!m6L2Content) {
    throw new Error("Failed to read L2_Argument_Passing.md");
  }

  await Lesson.create({
    title: "Argument Passing: Positional and Keyword",
    content: m6L2Content,
    shortDescription:
      "Learn to pass arguments by position, by explicit keyword, and use default values for parameters.",
    order: 2,
    moduleId: module6._id,
    xpReward: 35,
    duration: 20,
    contentType: "exercise",
    exercise: m6L2Exercise,
    isPublished: true,
  });

  // --- Lesson 6.3: Scope: Local vs. Global Variables (.md + .json files) ---
  const m6L3Content = readContent("Module6_Functions", "L3_Variable_Scope.md");
  const m6L3Exercise = parseJSONContent(
    "Module6_Functions",
    "L3_Exercise.json"
  );

  if (!m6L3Content) {
    throw new Error("Failed to read L3_Variable_Scope.md");
  }

  await Lesson.create({
    title: "Scope: Local vs. Global Variables",
    content: m6L3Content,
    shortDescription:
      "Understand Python's scope rules, the difference between local and global variables, and when to use the `global` keyword.",
    order: 3,
    moduleId: module6._id,
    xpReward: 35,
    duration: 20,
    contentType: "exercise",
    exercise: m6L3Exercise,
    isPublished: true,
  });

  // --- Lesson 6.4: Flexible Arguments: *args and **kwargs (.md + .json files) ---
  const m6L4Content = readContent(
    "Module6_Functions",
    "L4_Flexible_Arguments.md"
  );
  const m6L4Exercise = parseJSONContent(
    "Module6_Functions",
    "L4_Exercise.json"
  );

  if (!m6L4Content) {
    throw new Error("Failed to read L4_Flexible_Arguments.md");
  }

  await Lesson.create({
    title: "Flexible Arguments: *args and **kwargs",
    content: m6L4Content,
    shortDescription:
      "Learn to write functions that accept a variable number of positional arguments (`*args`) and keyword arguments (`**kwargs`).",
    order: 4,
    moduleId: module6._id,
    xpReward: 40,
    duration: 20,
    contentType: "exercise",
    exercise: m6L4Exercise,
    isPublished: true,
  });

  // --- Lesson 6.5: Lambda Functions: Anonymous One-Liners (.md + .json files) ---
  const m6L5Content = readContent(
    "Module6_Functions",
    "L5_Lambda_Functions.md"
  );
  const m6L5Exercise = parseJSONContent(
    "Module6_Functions",
    "L5_Exercise.json"
  );

  if (!m6L5Content) {
    throw new Error("Failed to read L5_Lambda_Functions.md");
  }

  await Lesson.create({
    title: "Lambda Functions: Anonymous One-Liners",
    content: m6L5Content,
    shortDescription:
      "Use the `lambda` keyword to create short, anonymous functions, often for custom sorting or filtering.",
    order: 5,
    moduleId: module6._id,
    xpReward: 30,
    duration: 15,
    contentType: "exercise",
    exercise: m6L5Exercise,
    isPublished: true,
  });

  // --- Lesson 6.6: Module Project: The User Data Processor (.md + .json files) ---
  const m6L6Content = readContent(
    "Module6_Functions",
    "L6_Project_Data_Processor.md"
  );
  const m6L6Exercise = parseJSONContent(
    "Module6_Functions",
    "L6_Exercise.json"
  );

  if (!m6L6Content) {
    throw new Error("Failed to read L6_Project_Data_Processor.md");
  }

  await Lesson.create({
    title: "Module Project: The User Data Processor",
    content: m6L6Content,
    shortDescription:
      "Final project: Implement a flexible function combining positional, `*args`, and `**kwargs` to process user profile data.",
    order: 6,
    moduleId: module6._id,
    xpReward: 100,
    duration: 45,
    contentType: "project",
    exercise: m6L6Exercise,
    isPublished: true,
  });

  //Module 7: File I/O Basics

  return [module6, module7, module8, module9, module10];
};

module.exports = seedModules6to10;
