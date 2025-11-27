// server/seeders/seedModules6-10.js

const seedModules6to10 = async (
  Lesson,
  Module,
  readContent,
  parseJSONContent,
  options = {}, // Add options parameter
  seedConfig = {}
) => {
  console.log("🚀 Seeding Modules 6-10 with config:", {
    batchSize: seedConfig.batchSize,
    modules: seedConfig.modules || "all",
  });

  // Extract module IDs from options
  const { module1_id = null, module4_id = null } = options;

  // Validate prerequisites
  if (!module1_id || !module4_id) {
    console.warn("⚠️ Missing prerequisite IDs for Module 6:", {
      module1_id,
      module4_id,
    });
  }

  // =======================
  // || MODULE 6: FUNCTIONS ||
  // =======================
  console.log("📘 Creating Module 6: Functions...");
  const module6 = await Module.create({
    title: "Functions",
    description:
      "Learn how to break code into reusable, organized blocks using functions, manage parameters, and control scope.",
    shortDescription:
      "Master defining, calling, and returning values from functions.",
    order: 6,
    difficulty: "beginner",
    estimatedHours: 2,
    isPublished: true,
    prerequisites: [module1_id, module4_id].filter(Boolean), // Use passed IDs with validation
    learningObjectives: [
      "Define functions using `def` and pass data via parameters.",
      "Differentiate between arguments, parameters, and return values.",
      "Understand scope (local vs. global variables) and the `global` keyword.",
      "Use positional, keyword, and default arguments effectively.",
      "Build practical functions for real-world programming tasks.",
    ],
    icon: "🛠️",
    xpReward: 200,
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

  // --- Lesson 6.4: Practical Functions Practice (.md + .json files) ---
  const m6L4Content = readContent(
    "Module6_Functions",
    "L4_Practical_Functions.md"
  );
  const m6L4Exercise = parseJSONContent(
    "Module6_Functions",
    "L4_Exercise.json"
  );

  if (!m6L4Content) {
    throw new Error("Failed to read L4_Practical_Functions.md");
  }

  await Lesson.create({
    title: "Practical Functions Practice",
    content: m6L4Content,
    shortDescription:
      "Apply function concepts to real-world scenarios with multiple practice exercises and use cases.",
    order: 4,
    moduleId: module6._id,
    xpReward: 40,
    duration: 25,
    contentType: "exercise",
    exercise: m6L4Exercise,
    isPublished: true,
  });

  // --- Lesson 6.5: Module Project: Calculator Builder (.md + .json files) ---
  const m6L5Content = readContent(
    "Module6_Functions",
    "L5_Project_Calculator_Builder.md"
  );
  const m6L5Exercise = parseJSONContent(
    "Module6_Functions",
    "L5_Exercise.json"
  );

  if (!m6L5Content) {
    throw new Error("Failed to read L5_Project_Calculator_Builder.md");
  }

  await Lesson.create({
    title: "Module Project: Calculator Builder",
    content: m6L5Content,
    shortDescription:
      "Build a modular calculator system using fundamental function concepts without advanced arguments.",
    order: 5,
    moduleId: module6._id,
    xpReward: 60,
    duration: 30,
    contentType: "project",
    exercise: m6L5Exercise,
    isPublished: true,
  });

  console.log("✅ Module 6 completed: 5 lessons created");

  // =============================
  // || MODULE 7: FILE I/O BASICS ||
  // =============================
  console.log("📘 Creating Module 7: File I/O Basics...");
  const module7 = await Module.create({
    title: "File I/O Basics",
    description:
      "Master reading from and writing to local files, a fundamental skill for data processing and persistence in Python.",
    shortDescription:
      "Learn to open, read, write, and safely manage local text files.",
    order: 7,
    difficulty: "beginner",
    estimatedHours: 2.5,
    isPublished: true,
    prerequisites: [module6._id],
    learningObjectives: [
      "Use the built-in `open()` function to establish a connection to a file.",
      "Differentiate between file modes (`r`, `w`, `a`) for reading, writing, and appending.",
      "Read entire file contents using `.read()` and line-by-line contents using `.readlines()`.",
      "Write data to files using `.write()`.",
      "Ensure files are safely closed using the `with open(...)` context manager.",
    ],
    icon: "📁",
    xpReward: 195,
  });

  // --- Lesson 7.1: Reading from Files: The open() function and .read() ---
  const m7L1Content = readContent("Module7_File_IO", "L1_Reading_Basics.md");
  const m7L1Exercise = parseJSONContent("Module7_File_IO", "L1_Exercise.json");

  if (!m7L1Content) {
    throw new Error("Failed to read L1_Reading_Basics.md");
  }

  await Lesson.create({
    title: "Reading from Files: The open() function and .read()",
    content: m7L1Content,
    shortDescription:
      "Introduce file handling using the `open()` function and the basic file reading methods.",
    order: 1,
    moduleId: module7._id,
    xpReward: 35,
    duration: 20,
    contentType: "exercise",
    exercise: m7L1Exercise,
    isPublished: true,
  });

  // --- Lesson 7.2: Reading Line by Line: .readline(), .readlines(), and File Iteration ---
  const m7L2Content = readContent("Module7_File_IO", "L2_Reading_Lines.md");
  const m7L2Exercise = parseJSONContent("Module7_File_IO", "L2_Exercise.json");

  if (!m7L2Content) {
    throw new Error("Failed to read L2_Reading_Lines.md");
  }

  await Lesson.create({
    title:
      "Reading Line by Line: .readline(), .readlines(), and File Iteration",
    content: m7L2Content,
    shortDescription:
      "Learn three distinct methods for processing text files line by line: `.readline()`, `.readlines()`, and the efficient `for` loop.",
    order: 2,
    moduleId: module7._id,
    xpReward: 35,
    duration: 20,
    contentType: "exercise",
    exercise: m7L2Exercise,
    isPublished: true,
  });

  // --- Lesson 7.3: The with open(...) Context Manager ---
  const m7L3Content = readContent("Module7_File_IO", "L3_Context_Manager.md");
  const m7L3Exercise = parseJSONContent("Module7_File_IO", "L3_Exercise.json");

  if (!m7L3Content) {
    throw new Error("Failed to read L3_Context_Manager.md");
  }

  await Lesson.create({
    title: "The `with open(...)` Context Manager",
    content: m7L3Content,
    shortDescription:
      "Adopt the Pythonic way to handle file operations safely using the `with` statement, guaranteeing automatic file closure.",
    order: 3,
    moduleId: module7._id,
    xpReward: 30,
    duration: 15,
    contentType: "exercise",
    exercise: m7L3Exercise,
    isPublished: true,
  });

  // --- Lesson 7.4: Writing to Files: The 'w' and 'a' Modes ---
  const m7L4Content = readContent("Module7_File_IO", "L4_Writing_To_Files.md");
  const m7L4Exercise = parseJSONContent("Module7_File_IO", "L4_Exercise.json");

  if (!m7L4Content) {
    throw new Error("Failed to read L4_Writing_To_Files.md");
  }

  await Lesson.create({
    title: "Writing to Files: The 'w' and 'a' Modes",
    content: m7L4Content,
    shortDescription:
      "Learn to save and log data using the write (`'w'`) and append (`'a'`) modes, understanding the critical difference between the two.",
    order: 4,
    moduleId: module7._id,
    xpReward: 40,
    duration: 20,
    contentType: "exercise",
    exercise: m7L4Exercise,
    isPublished: true,
  });

  // --- Lesson 7.5: Module Project: Simple Log File Processor ---
  const m7L5Content = readContent(
    "Module7_File_IO",
    "L5_Project_Log_Processor.md"
  );
  const m7L5Exercise = parseJSONContent("Module7_File_IO", "L5_Exercise.json");

  if (!m7L5Content) {
    throw new Error("Failed to read L5_Project_Log_Processor.md");
  }

  await Lesson.create({
    title: "Module Project: Simple Log File Processor",
    content: m7L5Content,
    shortDescription:
      "Final project: Apply all File I/O concepts to read a raw log file, filter for successful entries, and write the clean data to a new file.",
    order: 5,
    moduleId: module7._id,
    xpReward: 55,
    duration: 40,
    contentType: "project",
    exercise: m7L5Exercise,
    isPublished: true,
  });

  console.log("✅ Module 7 completed: 5 lessons created");

  // ================================
  // || MODULE 8: ERROR HANDLING   ||
  // ================================
  console.log("📘 Creating Module 8: Error Handling...");
  const module8 = await Module.create({
    title: "Error Handling: Try/Except",
    description:
      "Learn to write robust Python code that gracefully handles errors and exceptions without crashing.",
    shortDescription:
      "Master try/except blocks to catch and handle runtime errors safely.",
    order: 8,
    difficulty: "beginner",
    estimatedHours: 2,
    isPublished: true,
    prerequisites: [module7._id],
    learningObjectives: [
      "Understand the difference between syntax errors and exceptions",
      "Use try/except blocks to catch and handle specific exceptions",
      "Handle multiple exception types with different responses",
      "Use else and finally clauses for complete error handling",
      "Raise custom exceptions when needed",
    ],
    icon: "🛡️",
    xpReward: 150,
  });

  // --- Lesson 8.1: Introduction to Exceptions ---
  const m8L1Content = readContent(
    "Module8_Error_Handling",
    "L1_Introduction_Exceptions.md"
  );
  const m8L1Exercise = parseJSONContent(
    "Module8_Error_Handling",
    "L1_Exercise.json"
  );

  if (!m8L1Content) {
    throw new Error("Failed to read L1_Introduction_Exceptions.md");
  }

  await Lesson.create({
    title: "Introduction to Exceptions",
    content: m8L1Content,
    shortDescription:
      "Learn what exceptions are and how to catch them using basic try/except blocks.",
    order: 1,
    moduleId: module8._id,
    xpReward: 30,
    duration: 15,
    contentType: "exercise",
    exercise: m8L1Exercise,
    isPublished: true,
  });

  // --- Lesson 8.2: Handling Specific Exceptions ---
  const m8L2Content = readContent(
    "Module8_Error_Handling",
    "L2_Specific_Exceptions.md"
  );
  const m8L2Exercise = parseJSONContent(
    "Module8_Error_Handling",
    "L2_Exercise.json"
  );

  if (!m8L2Content) {
    throw new Error("Failed to read L2_Specific_Exceptions.md");
  }

  await Lesson.create({
    title: "Handling Specific Exceptions",
    content: m8L2Content,
    shortDescription:
      "Learn to catch specific exception types like ValueError, TypeError, and FileNotFoundError.",
    order: 2,
    moduleId: module8._id,
    xpReward: 35,
    duration: 20,
    contentType: "exercise",
    exercise: m8L2Exercise,
    isPublished: true,
  });

  // --- Lesson 8.3: Else and Finally Clauses ---
  const m8L3Content = readContent(
    "Module8_Error_Handling",
    "L3_Else_Finally.md"
  );
  const m8L3Exercise = parseJSONContent(
    "Module8_Error_Handling",
    "L3_Exercise.json"
  );

  if (!m8L3Content) {
    throw new Error("Failed to read L3_Else_Finally.md");
  }

  await Lesson.create({
    title: "Else and Finally Clauses",
    content: m8L3Content,
    shortDescription:
      "Master the complete try/except/else/finally structure for robust error handling.",
    order: 3,
    moduleId: module8._id,
    xpReward: 35,
    duration: 20,
    contentType: "exercise",
    exercise: m8L3Exercise,
    isPublished: true,
  });

  // --- Lesson 8.4: Raising Exceptions ---
  const m8L4Content = readContent(
    "Module8_Error_Handling",
    "L4_Raising_Exceptions.md"
  );
  const m8L4Exercise = parseJSONContent(
    "Module8_Error_Handling",
    "L4_Exercise.json"
  );

  if (!m8L4Content) {
    throw new Error("Failed to read L4_Raising_Exceptions.md");
  }

  await Lesson.create({
    title: "Raising Exceptions",
    content: m8L4Content,
    shortDescription:
      "Learn when and how to raise your own exceptions for input validation and error reporting.",
    order: 4,
    moduleId: module8._id,
    xpReward: 30,
    duration: 15,
    contentType: "exercise",
    exercise: m8L4Exercise,
    isPublished: true,
  });

  // --- Lesson 8.5: Project: Robust File Processor ---
  const m8L5Content = readContent(
    "Module8_Error_Handling",
    "L5_Project_Robust_Processor.md"
  );
  const m8L5Exercise = parseJSONContent(
    "Module8_Error_Handling",
    "L5_Exercise.json"
  );

  if (!m8L5Content) {
    throw new Error("Failed to read L5_Project_Robust_Processor.md");
  }

  await Lesson.create({
    title: "Project: Robust File Processor",
    content: m8L5Content,
    shortDescription:
      "Apply error handling to create a file processor that gracefully handles corrupt data and missing files.",
    order: 5,
    moduleId: module8._id,
    xpReward: 50,
    duration: 30,
    contentType: "project",
    exercise: m8L5Exercise,
    isPublished: true,
  });

  console.log("✅ Module 8 completed: 5 lessons created");

  // ====================================
  // || MODULE 9: LIST/DICT COMPREHENSIONS ||
  // ====================================
  console.log("📘 Creating Module 9: List/Dict Comprehensions...");
  const module9 = await Module.create({
    title: "List/Dict Comprehensions",
    description:
      "Master Python's concise and powerful comprehension syntax for creating lists, dictionaries, and sets with elegant one-liners.",
    shortDescription:
      "Learn to create lists and dictionaries efficiently using comprehensions with conditional logic.",
    order: 9,
    difficulty: "intermediate",
    estimatedHours: 2.5,
    isPublished: true,
    prerequisites: [module8._id],
    learningObjectives: [
      "Transform lists using list comprehensions with conditional logic",
      "Create dictionaries from various data sources using dict comprehensions",
      "Apply multiple conditions and transformations in comprehensions",
      "Understand when to use comprehensions vs traditional loops",
      "Convert between different data structures using comprehensions",
    ],
    icon: "⚡",
    xpReward: 210,
  });

  // --- Lesson 9.1: List Comprehensions Basics ---
  const m9L1Content = readContent(
    "Module9_Comprehensions",
    "L1_List_Comprehensions_Basics.md"
  );
  const m9L1Exercise = parseJSONContent(
    "Module9_Comprehensions",
    "L1_Exercise.json"
  );

  if (!m9L1Content) {
    throw new Error("Failed to read L1_List_Comprehensions_Basics.md");
  }

  await Lesson.create({
    title: "List Comprehensions Basics",
    content: m9L1Content,
    shortDescription:
      "Learn the fundamental syntax of list comprehensions for transforming and filtering data efficiently.",
    order: 1,
    moduleId: module9._id,
    xpReward: 35,
    duration: 20,
    contentType: "exercise",
    exercise: m9L1Exercise,
    isPublished: true,
  });

  // --- Lesson 9.2: Conditional List Comprehensions ---
  const m9L2Content = readContent(
    "Module9_Comprehensions",
    "L2_Conditional_Comprehensions.md"
  );
  const m9L2Exercise = parseJSONContent(
    "Module9_Comprehensions",
    "L2_Exercise.json"
  );

  if (!m9L2Content) {
    throw new Error("Failed to read L2_Conditional_Comprehensions.md");
  }

  await Lesson.create({
    title: "Conditional List Comprehensions",
    content: m9L2Content,
    shortDescription:
      "Add conditional logic to list comprehensions for advanced filtering and transformation.",
    order: 2,
    moduleId: module9._id,
    xpReward: 40,
    duration: 25,
    contentType: "exercise",
    exercise: m9L2Exercise,
    isPublished: true,
  });

  // --- Lesson 9.3: Dictionary Comprehensions ---
  const m9L3Content = readContent(
    "Module9_Comprehensions",
    "L3_Dictionary_Comprehensions.md"
  );
  const m9L3Exercise = parseJSONContent(
    "Module9_Comprehensions",
    "L3_Exercise.json"
  );

  if (!m9L3Content) {
    throw new Error("Failed to read L3_Dictionary_Comprehensions.md");
  }

  await Lesson.create({
    title: "Dictionary Comprehensions",
    content: m9L3Content,
    shortDescription:
      "Extend comprehension syntax to create dictionaries from various data sources.",
    order: 3,
    moduleId: module9._id,
    xpReward: 40,
    duration: 25,
    contentType: "exercise",
    exercise: m9L3Exercise,
    isPublished: true,
  });

  // --- Lesson 9.4: Nested Comprehensions & Advanced Patterns ---
  const m9L4Content = readContent(
    "Module9_Comprehensions",
    "L4_Nested_Comprehensions.md"
  );
  const m9L4Exercise = parseJSONContent(
    "Module9_Comprehensions",
    "L4_Exercise.json"
  );

  if (!m9L4Content) {
    throw new Error("Failed to read L4_Nested_Comprehensions.md");
  }

  await Lesson.create({
    title: "Nested Comprehensions & Advanced Patterns",
    content: m9L4Content,
    shortDescription:
      "Master nested comprehensions and learn when to use comprehensions vs traditional loops.",
    order: 4,
    moduleId: module9._id,
    xpReward: 35,
    duration: 20,
    contentType: "exercise",
    exercise: m9L4Exercise,
    isPublished: true,
  });

  // --- Lesson 9.5: Project: Data Transformation Pipeline ---
  const m9L5Content = readContent(
    "Module9_Comprehensions",
    "L5_Project_Data_Transformation.md"
  );
  const m9L5Exercise = parseJSONContent(
    "Module9_Comprehensions",
    "L5_Exercise.json"
  );

  if (!m9L5Content) {
    throw new Error("Failed to read L5_Project_Data_Transformation.md");
  }

  await Lesson.create({
    title: "Project: Data Transformation Pipeline",
    content: m9L5Content,
    shortDescription:
      "Apply comprehension techniques to build a data processing pipeline that transforms and analyzes datasets.",
    order: 5,
    moduleId: module9._id,
    xpReward: 60,
    duration: 35,
    contentType: "project",
    exercise: m9L5Exercise,
    isPublished: true,
  });

  console.log("✅ Module 9 completed: 5 lessons created");

  // =================================
  // || MODULE 10: ADVANCED FUNCTIONS ||
  // =================================
  console.log("📘 Creating Module 10: Advanced Functions...");
  const module10 = await Module.create({
    title: "Advanced Functions",
    description:
      "Master advanced function concepts including lambda functions, decorators, flexible arguments, and functional programming patterns to write more powerful and flexible Python code.",
    shortDescription:
      "Learn lambda functions, *args/**kwargs, decorators, and functional programming techniques.",
    order: 10,
    difficulty: "intermediate",
    estimatedHours: 3.5,
    isPublished: true,
    prerequisites: [module9._id],
    learningObjectives: [
      "Create and use lambda functions for concise operations and sorting",
      "Master *args and **kwargs for flexible function parameters",
      "Understand and apply function decorators for code enhancement",
      "Use map(), filter(), and reduce() for functional programming",
      "Build comprehensive function toolkits with advanced patterns",
      "Create higher-order functions that return or accept other functions",
    ],
    icon: "🎯",
    xpReward: 250,
  });

  // --- Lesson 10.1: Lambda Functions (Combined) ---
  const m10L1Content = readContent(
    "Module10_Advanced_Functions",
    "L1_Lambda_Functions.md"
  );
  const m10L1Exercise = parseJSONContent(
    "Module10_Advanced_Functions",
    "L1_Exercise.json"
  );

  if (!m10L1Content) {
    throw new Error("Failed to read L1_Lambda_Functions.md");
  }

  await Lesson.create({
    title: "Lambda Functions",
    content: m10L1Content,
    shortDescription:
      "Master anonymous lambda functions for concise operations, sorting, and functional programming patterns.",
    order: 1,
    moduleId: module10._id,
    xpReward: 45,
    duration: 25,
    contentType: "exercise",
    exercise: m10L1Exercise,
    isPublished: true,
  });

  // --- Lesson 10.2: *args and **kwargs (Combined) ---
  const m10L2Content = readContent(
    "Module10_Advanced_Functions",
    "L2_Args_Kwargs.md"
  );
  const m10L2Exercise = parseJSONContent(
    "Module10_Advanced_Functions",
    "L2_Exercise.json"
  );

  if (!m10L2Content) {
    throw new Error("Failed to read L2_Args_Kwargs.md");
  }

  await Lesson.create({
    title: "*args and **kwargs",
    content: m10L2Content,
    shortDescription:
      "Learn to create functions that accept flexible numbers of positional and keyword arguments with advanced patterns.",
    order: 2,
    moduleId: module10._id,
    xpReward: 50,
    duration: 30,
    contentType: "exercise",
    exercise: m10L2Exercise,
    isPublished: true,
  });

  // --- Lesson 10.3: Function Decorators ---
  const m10L3Content = readContent(
    "Module10_Advanced_Functions",
    "L3_Function_Decorators.md"
  );
  const m10L3Exercise = parseJSONContent(
    "Module10_Advanced_Functions",
    "L3_Exercise.json"
  );

  if (!m10L3Content) {
    throw new Error("Failed to read L3_Function_Decorators.md");
  }

  await Lesson.create({
    title: "Function Decorators",
    content: m10L3Content,
    shortDescription:
      "Learn to enhance functions using decorators for logging, timing, authentication, and more.",
    order: 3,
    moduleId: module10._id,
    xpReward: 55,
    duration: 35,
    contentType: "exercise",
    exercise: m10L3Exercise,
    isPublished: true,
  });

  // --- Lesson 10.4: Functional Programming Tools ---
  const m10L4Content = readContent(
    "Module10_Advanced_Functions",
    "L4_Functional_Programming_Tools.md"
  );
  const m10L4Exercise = parseJSONContent(
    "Module10_Advanced_Functions",
    "L4_Exercise.json"
  );

  if (!m10L4Content) {
    throw new Error("Failed to read L4_Functional_Programming_Tools.md");
  }

  await Lesson.create({
    title: "Functional Programming Tools",
    content: m10L4Content,
    shortDescription:
      "Master map(), filter(), reduce() and other functional programming tools for data transformation.",
    order: 4,
    moduleId: module10._id,
    xpReward: 45,
    duration: 30,
    contentType: "exercise",
    exercise: m10L4Exercise,
    isPublished: true,
  });

  // --- Lesson 10.5: Project: Advanced Function Toolkit Builder ---
  const m10L5Content = readContent(
    "Module10_Advanced_Functions",
    "L5_Project_Function_Toolkit.md"
  );
  const m10L5Exercise = parseJSONContent(
    "Module10_Advanced_Functions",
    "L5_Exercise.json"
  );

  if (!m10L5Content) {
    throw new Error("Failed to read L5_Project_Function_Toolkit.md");
  }

  await Lesson.create({
    title: "Project: Advanced Function Toolkit Builder",
    content: m10L5Content,
    shortDescription:
      "Build a comprehensive toolkit of utility functions using all advanced function concepts.",
    order: 5,
    moduleId: module10._id,
    xpReward: 75,
    duration: 45,
    contentType: "project",
    exercise: m10L5Exercise,
    isPublished: true,
  });

  console.log("✅ Module 10 completed: 5 lessons created");
  console.log(
    "🎉 Modules 6-10 seeding completed! Total: 5 modules, 25 lessons"
  );

  return [module6, module7, module8, module9, module10];
};

module.exports = seedModules6to10;
