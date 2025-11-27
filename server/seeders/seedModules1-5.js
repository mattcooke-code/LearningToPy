// server/seeders/seedModules1-5.js
const seedModules1to5 = async (
  Lesson,
  Module,
  readContent,
  parseJSONContent,
  seedConfig = {}
) => {
  console.log("🚀 Seeding Modules 1-5 with config:", {
    batchSize: seedConfig.batchSize,
    modules: seedConfig.modules || "all",
  });

  //  =================================
  // || MODULE 1: PYTHON FUNDAMENTALS ||
  //  =================================
  console.log("📘 Creating Module 1: Python Fundamentals...");
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
  });

  // Create lessons for module 1
  console.log("📝 Creating lessons for Module 1...");

  // --- Lesson 1.1: Welcome (from markdown) ---
  const m1L1Content = readContent("Module1_Fundamentals", "L1_Welcome.md");
  if (!m1L1Content) {
    throw new Error("Failed to read L1_Welcome.md");
  }

  await Lesson.create({
    title: "Welcome to Python",
    content: m1L1Content,
    shortDescription: "Get started with Python and write your first program",
    order: 1,
    moduleId: module1._id,
    xpReward: 25,
    duration: 10,
    contentType: "theory",
    isPublished: true,
  });

  // --- Lesson 1.2: Syntax Blueprint (from markdown + JSON exercise) ---
  const m1L2Content = readContent(
    "Module1_Fundamentals",
    "L2_Syntax_Blueprint.md"
  );
  const m1L2Exercise = parseJSONContent(
    "Module1_Fundamentals",
    "L2_Exercise.json"
  );

  if (!m1L2Content) {
    throw new Error("Failed to read L2_Syntax_Blueprint.md");
  }

  await Lesson.create({
    title: "Python Syntax Blueprint",
    content: m1L2Content,
    shortDescription: "Learn Python's rules for comments and indentation",
    order: 2,
    moduleId: module1._id,
    xpReward: 30,
    duration: 15,
    contentType: "exercise",
    exercise: m1L2Exercise,
    isPublished: true,
  });

  // --- Lesson 1.3: Variables: The Labelled Box (.md + .json files) ---
  const m1L3Content = readContent("Module1_Fundamentals", "L3_Variables.md");
  const m1L3Exercise = parseJSONContent(
    "Module1_Fundamentals",
    "L3_Exercise.json"
  );

  if (!m1L3Content) {
    throw new Error("Failed to read L3_Variables.md");
  }

  await Lesson.create({
    title: "Variables: The Labelled Box",
    content: m1L3Content,
    shortDescription:
      "Understand how to store data using variables and naming conventions.",
    order: 3,
    moduleId: module1._id,
    xpReward: 35,
    duration: 20,
    contentType: "exercise",
    exercise: m1L3Exercise,
    isPublished: true,
  });

  // --- Lesson 1.4: Basic Data Types (.md + .json files) ---
  const m1L4Content = readContent("Module1_Fundamentals", "L4_Data_Types.md");
  const m1L4Exercise = parseJSONContent(
    "Module1_Fundamentals",
    "L4_Exercise.json"
  );

  if (!m1L4Content) {
    throw new Error("Failed to read L4_Data_Types.md");
  }

  await Lesson.create({
    title: "Basic Data Types",
    content: m1L4Content,
    shortDescription:
      "Learn to work with String, Integer, Float, and Boolean types.",
    order: 4,
    moduleId: module1._id,
    xpReward: 40,
    duration: 25,
    contentType: "exercise",
    exercise: m1L4Exercise,
    isPublished: true,
  });

  // --- Lesson 1.5: Operators: Manipulating Data (.md + .json files) ---
  const m1L5Content = readContent("Module1_Fundamentals", "L5_Operators.md");
  const m1L5Exercise = parseJSONContent(
    "Module1_Fundamentals",
    "L5_Exercise.json"
  );

  if (!m1L5Content) {
    throw new Error("Failed to read L5_Operators.md");
  }

  await Lesson.create({
    title: "Operators: Manipulating Data",
    content: m1L5Content,
    shortDescription:
      "Learn Python's arithmetic rules and string concatenation.",
    order: 5,
    moduleId: module1._id,
    xpReward: 45,
    duration: 30,
    contentType: "exercise",
    exercise: m1L5Exercise,
    isPublished: true,
  });

  // --- Lesson 1.6: Module Project: Simple Calculator (.md + .json files) ---
  const m1L6Content = readContent(
    "Module1_Fundamentals",
    "L6_Project_Calculator.md"
  );
  const m1L6Exercise = parseJSONContent(
    "Module1_Fundamentals",
    "L6_Exercise.json"
  );

  if (!m1L6Content) {
    throw new Error("Failed to read L6_Project_Calculator.md");
  }

  await Lesson.create({
    title: "Module Project: Simple Calculator",
    content: m1L6Content,
    shortDescription:
      "Final project: Build a working calculator using all fundamental concepts.",
    order: 6,
    moduleId: module1._id,
    xpReward: 100,
    duration: 45,
    contentType: "project",
    exercise: m1L6Exercise,
    isPublished: true,
  });

  console.log("✅ Module 1 completed: 6 lessons created");

  //  =============================================
  // || MODULE 2: DATA STRUCTURES: LISTS & TUPLES ||
  //  =============================================
  console.log("📘 Creating Module 2: Data Structures...");
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
      "Differentiate between mutable (list) and immutable (tuple) structures",
      "Perform operations like indexing, slicing, and list methods",
    ],
    icon: "📊",
    xpReward: 150,
  });

  // --- Lesson 2.1: Lists: The Flexible Array (.md + .json files) ---
  const m2L1Content = readContent(
    "Module2_DataStructures",
    "L1_Lists_Indexing.md"
  );
  const m2L1Exercise = parseJSONContent(
    "Module2_DataStructures",
    "L1_Exercise.json"
  );

  if (!m2L1Content) {
    throw new Error("Failed to read L1_Lists_Indexing.md");
  }

  await Lesson.create({
    title: "Lists: The Flexible Array",
    content: m2L1Content,
    shortDescription:
      "Define lists and access elements using positive and negative indexing.",
    order: 1,
    moduleId: module2._id,
    xpReward: 30,
    duration: 15,
    contentType: "exercise",
    exercise: m2L1Exercise,
    isPublished: true,
  });

  // --- Lesson 2.2: The Art of Slicing (.md + .json files) ---
  const m2L2Content = readContent("Module2_DataStructures", "L2_Slicing.md");
  const m2L2Exercise = parseJSONContent(
    "Module2_DataStructures",
    "L2_Exercise.json"
  );

  if (!m2L2Content) {
    throw new Error("Failed to read L2_Slicing.md");
  }

  await Lesson.create({
    title: "The Art of Slicing",
    content: m2L2Content,
    shortDescription:
      "Extract subsets of a list using start, stop, and step values.",
    order: 2,
    moduleId: module2._id,
    xpReward: 35,
    duration: 15,
    contentType: "exercise",
    exercise: m2L2Exercise,
    isPublished: true,
  });

  // --- Lesson 2.3: Modifying Your Lists (.md + .json files) ---
  const m2L3Content = readContent(
    "Module2_DataStructures",
    "L3_Modifying_Lists.md"
  );
  const m2L3Exercise = parseJSONContent(
    "Module2_DataStructures",
    "L3_Exercise.json"
  );

  if (!m2L3Content) {
    throw new Error("Failed to read L3_Modifying_Lists.md");
  }

  await Lesson.create({
    title: "Modifying Your Lists",
    content: m2L3Content,
    shortDescription:
      "Change existing elements and add new ones using index assignment and methods like append and insert.",
    order: 3,
    moduleId: module2._id,
    xpReward: 40,
    duration: 20,
    contentType: "exercise",
    exercise: m2L3Exercise,
    isPublished: true,
  });

  // --- Lesson 2.4: Removing Data from Lists (.md + .json files) ---
  const m2L4Content = readContent(
    "Module2_DataStructures",
    "L4_Removing_Data.md"
  );
  const m2L4Exercise = parseJSONContent(
    "Module2_DataStructures",
    "L4_Exercise.json"
  );

  if (!m2L4Content) {
    throw new Error("Failed to read L4_Removing_Data.md");
  }

  await Lesson.create({
    title: "Removing Data from Lists",
    content: m2L4Content,
    shortDescription:
      "Use list methods like remove() and pop() and the del keyword to clean up lists.",
    order: 4,
    moduleId: module2._id,
    xpReward: 40,
    duration: 20,
    contentType: "exercise",
    exercise: m2L4Exercise,
    isPublished: true,
  });

  // --- Lesson 2.5: Tuples: The Immutable List (.md + .json files) ---
  const m2L5Content = readContent(
    "Module2_DataStructures",
    "L5_Tuples_Immutable.md"
  );
  const m2L5Exercise = parseJSONContent(
    "Module2_DataStructures",
    "L5_Exercise.json"
  );

  if (!m2L5Content) {
    throw new Error("Failed to read L5_Tuples_Immutable.md");
  }

  await Lesson.create({
    title: "Tuples: The Immutable List",
    content: m2L5Content,
    shortDescription:
      "Define tuples and understand the key difference: they are ordered but immutable.",
    order: 5,
    moduleId: module2._id,
    xpReward: 25,
    duration: 15,
    contentType: "theory",
    exercise: m2L5Exercise,
    isPublished: true,
  });

  // --- Lesson 2.6: Module Project: Inventory Manager (.md + .json files) ---
  const m2L6Content = readContent(
    "Module2_DataStructures",
    "L6_Project_Inventory.md"
  );
  const m2L6Exercise = parseJSONContent(
    "Module2_DataStructures",
    "L6_Exercise.json"
  );

  if (!m2L6Content) {
    throw new Error("Failed to read L6_Project_Inventory.md");
  }

  await Lesson.create({
    title: "Module Project: Inventory Manager",
    content: m2L6Content,
    shortDescription:
      "Final project: Build a simple inventory tool using all List and Tuple concepts.",
    order: 6,
    moduleId: module2._id,
    xpReward: 120,
    duration: 45,
    contentType: "project",
    exercise: m2L6Exercise,
    isPublished: true,
  });

  console.log("✅ Module 2 completed: 6 lessons created");

  //   ========================================
  //  || MODULE 3: CONTROL FLOW: CONDITIONALS ||
  //   ========================================
  console.log("📘 Creating Module 3: Control Flow...");
  const module3 = await Module.create({
    title: "Control Flow: Conditionals",
    description:
      "Learn how to make decisions in your code using if, elif, and else statements.",
    shortDescription:
      "Master decision-making logic with conditional statements and operators.",
    order: 3,
    difficulty: "beginner",
    estimatedHours: 2,
    isPublished: true,
    prerequisites: [module1._id],
    learningObjectives: [
      "Write code that executes blocks based on a condition.",
      "Understand and use comparison operators (==, >, <=, etc.).",
      "Combine multiple conditions using logical operators (and, or, not).",
    ],
    icon: "🚥",
    xpReward: 120,
  });

  // --- Lesson 3.1: If, Elif, and Else (.md + .json files) ---
  const m3L1Content = readContent("Module3_ControlFlow", "L1_Conditionals.md");
  const m3L1Exercise = parseJSONContent(
    "Module3_ControlFlow",
    "L1_Exercise.json"
  );

  if (!m3L1Content) {
    throw new Error("Failed to read L1_Conditionals.md");
  }

  await Lesson.create({
    title: "Decisions, Decisions: The `if` Statement",
    content: m3L1Content,
    shortDescription:
      "Learn to control code execution using if, elif, and else statements.",
    order: 1,
    moduleId: module3._id,
    xpReward: 30,
    duration: 15,
    contentType: "exercise",
    exercise: m3L1Exercise,
    isPublished: true,
  });

  // --- Lesson 3.2: Comparison and Logical Operators (.md + .json files) ---
  const m3L2Content = readContent(
    "Module3_ControlFlow",
    "L2_Operators_Comparison_Logical.md"
  );
  const m3L2Exercise = parseJSONContent(
    "Module3_ControlFlow",
    "L2_Exercise.json"
  );

  if (!m3L2Content) {
    throw new Error("Failed to read L2_Operators_Comparison_Logical.md");
  }

  await Lesson.create({
    title: "Comparison and Logical Operators",
    content: m3L2Content,
    shortDescription:
      "Build complex conditions using equality, greater-than/less-than, AND, OR, and NOT.",
    order: 2,
    moduleId: module3._id,
    xpReward: 40,
    duration: 20,
    contentType: "exercise",
    exercise: m3L2Exercise,
    isPublished: true,
  });

  // --- Lesson 3.3: Truthiness and Falsiness (.md + .json files) ---
  const m3L3Content = readContent("Module3_ControlFlow", "L3_Truthiness.md");
  const m3L3Exercise = parseJSONContent(
    "Module3_ControlFlow",
    "L3_Exercise.json"
  );

  if (!m3L3Content) {
    throw new Error("Failed to read L3_Truthiness.md");
  }

  await Lesson.create({
    title: "Truthiness and Falsiness",
    content: m3L3Content,
    shortDescription:
      "Use Python's built-in truth value system to write cleaner conditional checks.",
    order: 3,
    moduleId: module3._id,
    xpReward: 30,
    duration: 15,
    contentType: "exercise",
    exercise: m3L3Exercise,
    isPublished: true,
  });

  // --- Lesson 3.4: The Ternary Operator (.md + .json files) ---
  const m3L4Content = readContent(
    "Module3_ControlFlow",
    "L4_Ternary_Operator.md"
  );
  const m3L4Exercise = parseJSONContent(
    "Module3_ControlFlow",
    "L4_Exercise.json"
  );

  if (!m3L4Content) {
    throw new Error("Failed to read L4_Ternary_Operator.md");
  }

  await Lesson.create({
    title: "The Ternary Operator: One-Line Logic",
    content: m3L4Content,
    shortDescription:
      "Write concise if/else statements on a single line for variable assignment.",
    order: 4,
    moduleId: module3._id,
    xpReward: 35,
    duration: 15,
    contentType: "exercise",
    exercise: m3L4Exercise,
    isPublished: true,
  });

  // --- Lesson 3.5: Membership Operators (.md + .json files) ---
  const m3L5Content = readContent(
    "Module3_ControlFlow",
    "L5_Membership_Operators.md"
  );
  const m3L5Exercise = parseJSONContent(
    "Module3_ControlFlow",
    "L5_Exercise.json"
  );

  if (!m3L5Content) {
    throw new Error("Failed to read L5_Membership_Operators.md");
  }

  await Lesson.create({
    title: "Membership Operators: `in` and `not in`",
    content: m3L5Content,
    shortDescription:
      "Efficiently check if an element exists within a list, tuple, or string.",
    order: 5,
    moduleId: module3._id,
    xpReward: 35,
    duration: 15,
    contentType: "exercise",
    exercise: m3L5Exercise,
    isPublished: true,
  });

  // --- Lesson 3.6: Module Project: The Role Selector (.md + .json files) ---
  const m3L6Content = readContent(
    "Module3_ControlFlow",
    "L6_Project_Role_Selector.md"
  );
  const m3L6Exercise = parseJSONContent(
    "Module3_ControlFlow",
    "L6_Exercise.json"
  );

  if (!m3L6Content) {
    throw new Error("Failed to read L6_Project_Role_Selector.md");
  }

  await Lesson.create({
    title: "Module Project: The Role Selector",
    content: m3L6Content,
    shortDescription:
      "Final project: Implement a multi-level access control system using all conditional operators and statements.",
    order: 6,
    moduleId: module3._id,
    xpReward: 100,
    duration: 45,
    contentType: "project",
    exercise: m3L6Exercise,
    isPublished: true,
  });

  console.log("✅ Module 3 completed: 6 lessons created");

  //   =======================
  //  || MODULE 4: ITERATION ||
  //   =======================
  console.log("📘 Creating Module 4: Iteration...");
  const module4 = await Module.create({
    title: "Iteration",
    description:
      "Learn how to automate repetitive tasks and process collections of data using for and while loops.",
    shortDescription:
      "Master loops, the range() function, and control keywords like break and continue.",
    order: 4,
    difficulty: "beginner",
    estimatedHours: 2.5,
    isPublished: true,
    prerequisites: [module2._id, module3._id],
    learningObjectives: [
      "Use `for` loops to iterate over lists, tuples, and strings.",
      "Control iteration count using the `range()` function.",
      "Implement `while` loops for indefinite repetition.",
      "Manage loop flow using `break` and `continue`.",
    ],
    icon: "🔁",
    xpReward: 130,
  });

  // --- Lesson 4.1: The For Loop: Iterating Over Sequences (.md + .json files) ---
  const m4L1Content = readContent("Module4_Iteration", "L1_For_Loop_Basics.md");
  const m4L1Exercise = parseJSONContent(
    "Module4_Iteration",
    "L1_Exercise.json"
  );

  if (!m4L1Content) {
    throw new Error("Failed to read L1_For_Loop_Basics.md");
  }

  await Lesson.create({
    title: "The For Loop: Iterating Over Sequences",
    content: m4L1Content,
    shortDescription:
      "Use the `for` loop and `enumerate()` to process every item in a list or string.",
    order: 1,
    moduleId: module4._id,
    xpReward: 30,
    duration: 15,
    contentType: "exercise",
    exercise: m4L1Exercise,
    isPublished: true,
  });

  // --- Lesson 4.2: The range() Function (.md + .json files) ---
  const m4L2Content = readContent("Module4_Iteration", "L2_Range_Function.md");
  const m4L2Exercise = parseJSONContent(
    "Module4_Iteration",
    "L2_Exercise.json"
  );

  if (!m4L2Content) {
    throw new Error("Failed to read L2_Range_Function.md");
  }

  await Lesson.create({
    title: "The `range()` Function: Counting and Stepping",
    content: m4L2Content,
    shortDescription:
      "Generate sequences of numbers using `range()` for count-based and indexed loops.",
    order: 2,
    moduleId: module4._id,
    xpReward: 35,
    duration: 15,
    contentType: "exercise",
    exercise: m4L2Exercise,
    isPublished: true,
  });

  // --- Lesson 4.3: The while Loop: Repeating Until a Condition (.md + .json files) ---
  const m4L3Content = readContent("Module4_Iteration", "L3_While_Loop.md");
  const m4L3Exercise = parseJSONContent(
    "Module4_Iteration",
    "L3_Exercise.json"
  );

  if (!m4L3Content) {
    throw new Error("Failed to read L3_While_Loop.md");
  }

  await Lesson.create({
    title: "The `while` Loop: Repeating Until a Condition",
    content: m4L3Content,
    shortDescription:
      "Implement indefinite repetition using the `while` loop and manage counters to prevent infinite loops.",
    order: 3,
    moduleId: module4._id,
    xpReward: 35,
    duration: 20,
    contentType: "exercise",
    exercise: m4L3Exercise,
    isPublished: true,
  });

  // --- Lesson 4.4: Controlling the Flow: break and continue (.md + .json files) ---
  const m4L4Content = readContent("Module4_Iteration", "L4_Break_Continue.md");
  const m4L4Exercise = parseJSONContent(
    "Module4_Iteration",
    "L4_Exercise.json"
  );

  if (!m4L4Content) {
    throw new Error("Failed to read L4_Break_Continue.md");
  }

  await Lesson.create({
    title: "Controlling the Flow: `break` and `continue`",
    content: m4L4Content,
    shortDescription:
      "Modify loop behavior using `break` to exit early and `continue` to skip iterations.",
    order: 4,
    moduleId: module4._id,
    xpReward: 35,
    duration: 15,
    contentType: "exercise",
    exercise: m4L4Exercise,
    isPublished: true,
  });

  // --- Lesson 4.5: Nested Loops (.md + .json files) ---
  const m4L5Content = readContent("Module4_Iteration", "L5_Nested_Loops.md");
  const m4L5Exercise = parseJSONContent(
    "Module4_Iteration",
    "L5_Exercise.json"
  );

  if (!m4L5Content) {
    throw new Error("Failed to read L5_Nested_Loops.md");
  }

  await Lesson.create({
    title: "Nested Loops: Working with Grids",
    content: m4L5Content,
    shortDescription:
      "Learn to place loops inside each other to process two-dimensional data like lists of lists.",
    order: 5,
    moduleId: module4._id,
    xpReward: 40,
    duration: 20,
    contentType: "exercise",
    exercise: m4L5Exercise,
    isPublished: true,
  });

  // --- Lesson 4.6: Module Project: The Data Processor (.md + .json files) ---
  const m4L6Content = readContent(
    "Module4_Iteration",
    "L6_Project_Data_Processor.md"
  );
  const m4L6Exercise = parseJSONContent(
    "Module4_Iteration",
    "L6_Exercise.json"
  );

  if (!m4L6Content) {
    throw new Error("Failed to read L6_Project_Data_Processor.md");
  }

  await Lesson.create({
    title: "Module Project: The Data Processor",
    content: m4L6Content,
    shortDescription:
      "Final project: Implement a transaction processing system combining `for`, `continue`, and `break` based on a budget limit.",
    order: 6,
    moduleId: module4._id,
    xpReward: 100,
    duration: 45,
    contentType: "project",
    exercise: m4L6Exercise,
    isPublished: true,
  });

  console.log("✅ Module 4 completed: 6 lessons created");

  //   ==================================================
  //  || MODULE 5: DATA STRUCTURES: DICTIONARIES & SETS ||
  //   ==================================================
  console.log("📘 Creating Module 5: Dictionaries & Sets...");
  const module5 = await Module.create({
    title: "Data Structures: Dictionaries & Sets",
    description:
      "Explore unordered data types: key-value pairs (Dictionaries) and unique item collections (Sets).",
    shortDescription:
      "Master Dictionaries for fast data retrieval and Sets for unique element management.",
    order: 5,
    difficulty: "beginner",
    estimatedHours: 2.5,
    isPublished: true,
    prerequisites: [module2._id],
    learningObjectives: [
      "Define and manipulate Dictionaries using key-value pairs.",
      "Use Dictionary methods like `.get()`, `.keys()`, and `.values()`.",
      "Understand the properties of Sets (uniqueness and unorderdness).",
      "Perform Set operations: union, intersection, difference.",
    ],
    icon: "📖",
    xpReward: 170,
  });

  // --- Lesson 5.1: Dictionaries: Key-Value Pairs (.md + .json files) ---
  const m5L1Content = readContent(
    "Module5_DataStructures",
    "L1_Dict_Basics.md"
  );
  const m5L1Exercise = parseJSONContent(
    "Module5_DataStructures",
    "L1_Exercise.json"
  );

  if (!m5L1Content) {
    throw new Error("Failed to read L1_Dict_Basics.md");
  }

  await Lesson.create({
    title: "Dictionaries: Key-Value Pairs",
    content: m5L1Content,
    shortDescription:
      "Define dictionaries, access data by key, and use the safe `.get()` method.",
    order: 1,
    moduleId: module5._id,
    xpReward: 35,
    duration: 15,
    contentType: "exercise",
    exercise: m5L1Exercise,
    isPublished: true,
  });

  // --- Lesson 5.2: Dictionary Methods and Iteration (.md + .json files) ---
  const m5L2Content = readContent(
    "Module5_DataStructures",
    "L2_Dict_Manipulation.md"
  );
  const m5L2Exercise = parseJSONContent(
    "Module5_DataStructures",
    "L2_Exercise.json"
  );

  if (!m5L2Content) {
    throw new Error("Failed to read L2_Dict_Manipulation.md");
  }

  await Lesson.create({
    title: "Dictionary Methods and Iteration",
    content: m5L2Content,
    shortDescription:
      "Modify dictionaries using bracket notation and remove items with `.pop()` and `del`. Iterate using `.keys()`, `.values()`, and `.items()`.",
    order: 2,
    moduleId: module5._id,
    xpReward: 40,
    duration: 20,
    contentType: "exercise",
    exercise: m5L2Exercise,
    isPublished: true,
  });

  // --- Lesson 5.3: Sets: Unique, Unordered Collections (.md + .json files) ---
  const m5L3Content = readContent(
    "Module5_DataStructures",
    "L3_Sets_Basics.md"
  );
  const m5L3Exercise = parseJSONContent(
    "Module5_DataStructures",
    "L3_Exercise.json"
  );

  if (!m5L3Content) {
    throw new Error("Failed to read L3_Sets_Basics.md");
  }

  await Lesson.create({
    title: "Sets: Unique, Unordered Collections",
    content: m5L3Content,
    shortDescription:
      "Learn to use Sets for automatic data deduplication and efficient membership testing.",
    order: 3,
    moduleId: module5._id,
    xpReward: 30,
    duration: 15,
    contentType: "exercise",
    exercise: m5L3Exercise,
    isPublished: true,
  });

  // --- Lesson 5.4: Set Operations: Union, Intersection, and Difference (.md + .json files) ---
  const m5L4Content = readContent(
    "Module5_DataStructures",
    "L4_Set_Operations.md"
  );
  const m5L4Exercise = parseJSONContent(
    "Module5_DataStructures",
    "L4_Exercise.json"
  );

  if (!m5L4Content) {
    throw new Error("Failed to read L4_Set_Operations.md");
  }

  await Lesson.create({
    title: "Set Operations: Union, Intersection, and Difference",
    content: m5L4Content,
    shortDescription:
      "Combine and compare sets using the Union (`|`), Intersection (`&`), and Difference (`-`) operators.",
    order: 4,
    moduleId: module5._id,
    xpReward: 40,
    duration: 20,
    contentType: "exercise",
    exercise: m5L4Exercise,
    isPublished: true,
  });

  // --- Lesson 5.5: Data Structure Review: Choosing the Right Tool (.md + .json files) ---
  const m5L5Content = readContent(
    "Module5_DataStructures",
    "L5_Structure_Review.md"
  );
  const m5L5Exercise = parseJSONContent(
    "Module5_DataStructures",
    "L5_Exercise.json"
  );

  if (!m5L5Content) {
    throw new Error("Failed to read L5_Structure_Review.md");
  }

  await Lesson.create({
    title: "Data Structure Review: Choosing the Right Tool",
    content: m5L5Content,
    shortDescription:
      "Review the differences between List, Tuple, Dictionary, and Set and select the best structure for various real-world scenarios.",
    order: 5,
    moduleId: module5._id,
    xpReward: 30,
    duration: 15,
    contentType: "exercise",
    exercise: m5L5Exercise,
    isPublished: true,
  });

  // --- Lesson 5.6: Module Project: Inventory and Tag Manager (.md + .json files) ---
  const m5L6Content = readContent(
    "Module5_DataStructures",
    "L6_Project_Tag_Manager.md"
  );
  const m5L6Exercise = parseJSONContent(
    "Module5_DataStructures",
    "L6_Exercise.json"
  );

  if (!m5L6Content) {
    throw new Error("Failed to read L6_Project_Tag_Manager.md");
  }

  await Lesson.create({
    title: "Module Project: Inventory and Tag Manager",
    content: m5L6Content,
    shortDescription:
      "Final project: Combine Dictionaries and Sets to manage product inventory and tag compliance.",
    order: 6,
    moduleId: module5._id,
    xpReward: 100,
    duration: 45,
    contentType: "project",
    exercise: m5L6Exercise,
    isPublished: true,
  });

  console.log("✅ Module 5 completed: 6 lessons created");
  console.log("🎉 Modules 1-5 seeding completed! Total: 5 modules, 30 lessons");

  return [module1, module2, module3, module4, module5];
};

module.exports = seedModules1to5;
