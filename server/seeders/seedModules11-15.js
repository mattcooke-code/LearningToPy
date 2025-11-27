// server/seeders/seedModules11-15.js
const seedModules11to15 = async (
  Lesson,
  Module,
  readContent,
  parseJSONContent,
  options = {},
  seedConfig = {}
) => {
  console.log("🚀 Seeding Modules 11-15 with config:", {
    batchSize: seedConfig.batchSize,
    modules: seedConfig.modules || "all",
  });

  // Extract module IDs from options with validation
  const { module10_id = null, module1_id = null } = options;

  if (!module10_id || !module1_id) {
    console.warn("⚠️ Missing module IDs in options:", {
      module10_id,
      module1_id,
    });
  }

  //  =======================================
  // || MODULE 11: OBJECT-ORIENTED PROGRAMMING (OOP) I ||
  //  =======================================
  console.log("📘 Creating Module 11: OOP I...");
  const module11 = await Module.create({
    title: "Object-Oriented Programming (OOP) I",
    description:
      "Understand the core principles of OOP—Encapsulation, Abstraction, and the creation of custom types using Classes and Objects.",
    shortDescription:
      "Master defining classes, creating objects, and managing attributes and methods using `__init__` and `self`.",
    order: 11,
    difficulty: "intermediate",
    estimatedHours: 3.5,
    isPublished: true,
    prerequisites: module10_id ? [module10_id] : [],
    learningObjectives: [
      "Define classes and create instances (objects).",
      "Understand the role of the `__init__` constructor and the `self` parameter.",
      "Define and access instance attributes and methods.",
      "Differentiate between class attributes and instance attributes.",
      "Apply the principle of encapsulation in class design.",
    ],
    icon: "🧱",
    xpReward: 250,
  });

  // --- Lesson 11.1: Classes, Objects, and Instantiation (.md + .json files) ---
  const m11L1Content = readContent("Module11_OOP1", "L1_Classes_Objects.md");
  if (!m11L1Content) {
    throw new Error("Failed to read L1_Classes_Objects.md");
  }

  await Lesson.create({
    title: "Classes, Objects, and Instantiation",
    content: m11L1Content,
    shortDescription:
      "Introduce the blueprint of a class and how to create individual objects from it.",
    order: 1,
    moduleId: module11._id,
    xpReward: 40,
    duration: 25,
    contentType: "exercise",
    exercise: parseJSONContent("Module11_OOP1", "L1_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 11.2: The __init__ Constructor and Attributes (.md + .json files) ---
  const m11L2Content = readContent("Module11_OOP1", "L2_Init_Attributes.md");
  if (!m11L2Content) {
    throw new Error("Failed to read L2_Init_Attributes.md");
  }

  await Lesson.create({
    title: "The `__init__` Constructor and Attributes",
    content: m11L2Content,
    shortDescription:
      "Learn to initialize object state and define the critical `__init__` method and the `self` keyword.",
    order: 2,
    moduleId: module11._id,
    xpReward: 45,
    duration: 30,
    contentType: "exercise",
    exercise: parseJSONContent("Module11_OOP1", "L2_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 11.3: Instance Methods and Encapsulation (.md + .json files) ---
  const m11L3Content = readContent(
    "Module11_OOP1",
    "L3_Methods_Encapsulation.md"
  );
  if (!m11L3Content) {
    throw new Error("Failed to read L3_Methods_Encapsulation.md");
  }

  await Lesson.create({
    title: "Instance Methods and Encapsulation",
    content: m11L3Content,
    shortDescription:
      "Define behavior using methods and introduce basic concepts of data hiding (encapsulation).",
    order: 3,
    moduleId: module11._id,
    xpReward: 45,
    duration: 30,
    contentType: "exercise",
    exercise: parseJSONContent("Module11_OOP1", "L3_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 11.4: Class Variables and Static Methods (.md + .json files) ---
  const m11L4Content = readContent("Module11_OOP1", "L4_Class_Static.md");
  if (!m11L4Content) {
    throw new Error("Failed to read L4_Class_Static.md");
  }

  await Lesson.create({
    title: "Class Variables and Static Methods",
    content: m11L4Content,
    shortDescription:
      "Explore variables shared by all instances and methods that don't depend on instance state.",
    order: 4,
    moduleId: module11._id,
    xpReward: 30,
    duration: 15,
    contentType: "exercise",
    exercise: parseJSONContent("Module11_OOP1", "L4_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 11.5: Project: Building a Simple Game Character Class ---
  const m11L5Content = readContent(
    "Module11_OOP1",
    "L5_Project_Game_Character.md"
  );
  if (!m11L5Content) {
    throw new Error("Failed to read L5_Project_Game_Character.md");
  }

  await Lesson.create({
    title: "Project: Building a Simple Game Character Class",
    content: m11L5Content,
    shortDescription:
      "Final project: Design and implement a `Character` class with attributes, methods, and a constructor.",
    order: 5,
    moduleId: module11._id,
    xpReward: 90,
    duration: 50,
    contentType: "project",
    exercise: parseJSONContent("Module11_OOP1", "L5_Exercise.json"),
    isPublished: true,
  });

  console.log("✅ Module 11 completed: 5 lessons created");

  //  =======================================
  // || MODULE 12: OOP II: INHERITANCE & POLYMORPHISM ||
  //  =======================================
  console.log("📘 Creating Module 12: OOP II...");
  const module12 = await Module.create({
    title: "OOP II: Inheritance & Polymorphism",
    description:
      "Advance your OOP skills by implementing relationships between classes using Inheritance and Polymorphism.",
    shortDescription:
      "Learn to extend classes, use `super()`, and implement method overriding.",
    order: 12,
    difficulty: "intermediate",
    estimatedHours: 3.5,
    isPublished: true,
    prerequisites: [module11._id],
    learningObjectives: [
      "Implement inheritance to create parent/child class relationships.",
      "Use the `super()` function to call parent methods and constructors.",
      "Implement method overriding to change parent class behavior in a child class.",
      "Understand and utilize polymorphism for flexible code.",
      "Briefly introduce Abstract Base Classes (ABCs) for enforcing structure.",
    ],
    icon: "🔗",
    xpReward: 250,
  });

  // --- Lesson 12.1: Introduction to Inheritance (.md + .json files) ---
  const m12L1Content = readContent("Module12_OOP2", "L1_Inheritance_Basics.md");
  if (!m12L1Content) {
    throw new Error("Failed to read L1_Inheritance_Basics.md");
  }

  await Lesson.create({
    title: "Introduction to Inheritance",
    content: m12L1Content,
    shortDescription:
      "Create a new class that inherits attributes and methods from an existing class.",
    order: 1,
    moduleId: module12._id,
    xpReward: 45,
    duration: 30,
    contentType: "exercise",
    exercise: parseJSONContent("Module12_OOP2", "L1_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 12.2: Calling Parent Methods with super() (.md + .json files) ---
  const m12L2Content = readContent("Module12_OOP2", "L2_Super_Keyword.md");
  if (!m12L2Content) {
    throw new Error("Failed to read L2_Super_Keyword.md");
  }

  await Lesson.create({
    title: "Calling Parent Methods with `super()`",
    content: m12L2Content,
    shortDescription:
      "Safely and correctly call the constructor and methods of the parent class from the child class.",
    order: 2,
    moduleId: module12._id,
    xpReward: 45,
    duration: 30,
    contentType: "exercise",
    exercise: parseJSONContent("Module12_OOP2", "L2_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 12.3: Method Overriding and Polymorphism (.md + .json files) ---
  const m12L3Content = readContent(
    "Module12_OOP2",
    "L3_Overriding_Polymorphism.md"
  );
  if (!m12L3Content) {
    throw new Error("Failed to read L3_Overriding_Polymorphism.md");
  }

  await Lesson.create({
    title: "Method Overriding and Polymorphism",
    content: m12L3Content,
    shortDescription:
      "Customize inherited methods and leverage polymorphism to treat objects of different classes uniformly.",
    order: 3,
    moduleId: module12._id,
    xpReward: 50,
    duration: 35,
    contentType: "exercise",
    exercise: parseJSONContent("Module12_OOP2", "L3_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 12.4: Abstract Base Classes (ABCs) Brief Introduction (.md + .json files) ---
  const m12L4Content = readContent("Module12_OOP2", "L4_ABCs.md");
  if (!m12L4Content) {
    throw new Error("Failed to read L4_ABCs.md");
  }

  await Lesson.create({
    title: "Abstract Base Classes (ABCs) Brief Introduction",
    content: m12L4Content,
    shortDescription:
      "Get a brief look at the concept of abstract classes for defining interfaces.",
    order: 4,
    moduleId: module12._id,
    xpReward: 30,
    duration: 20,
    contentType: "exercise",
    exercise: parseJSONContent("Module12_OOP2", "L4_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 12.5: Project: Building a Shape Hierarchy ---
  const m12L5Content = readContent(
    "Module12_OOP2",
    "L5_Project_Shape_Hierarchy.md"
  );
  if (!m12L5Content) {
    throw new Error("Failed to read L5_Project_Shape_Hierarchy.md");
  }

  await Lesson.create({
    title: "Project: Building a Shape Hierarchy",
    content: m12L5Content,
    shortDescription:
      "Final project: Implement an OOP hierarchy (e.g., `Shape` > `Circle`/`Square`) to demonstrate inheritance and polymorphism.",
    order: 5,
    moduleId: module12._id,
    xpReward: 80,
    duration: 45,
    contentType: "project",
    exercise: parseJSONContent("Module12_OOP2", "L5_Exercise.json"),
    isPublished: true,
  });

  console.log("✅ Module 12 completed: 5 lessons created");

  //  =======================================
  // || MODULE 13: WORKING WITH DATES & TIME ||
  //  =======================================
  console.log("📘 Creating Module 13: Dates & Time...");
  const module13 = await Module.create({
    title: "Working with Dates & Time",
    description:
      "Learn to handle and manipulate date, time, and timezone information using Python's built-in `datetime` module.",
    shortDescription:
      "Master creating, formatting, and comparing datetime objects.",
    order: 13,
    difficulty: "intermediate",
    estimatedHours: 2.5,
    isPublished: true,
    prerequisites: module1_id ? [module1_id] : [],
    learningObjectives: [
      "Create `date`, `time`, `datetime`, and `timedelta` objects.",
      "Format datetime objects into strings using `strftime()`.",
      "Parse strings into datetime objects using `strptime()`.",
      "Perform date arithmetic (addition/subtraction) using `timedelta`.",
      "Handle time zones and convert between them.",
    ],
    icon: "⏰",
    xpReward: 190,
  });

  // --- Lesson 13.1: The datetime Module and Basic Objects (.md + .json files) ---
  const m13L1Content = readContent(
    "Module13_Datetime",
    "L1_Datetime_Basics.md"
  );
  if (!m13L1Content) {
    throw new Error("Failed to read L1_Datetime_Basics.md");
  }

  await Lesson.create({
    title: "The `datetime` Module and Basic Objects",
    content: m13L1Content,
    shortDescription:
      "Introduce the core objects: `date`, `time`, and `datetime`, and how to get the current time.",
    order: 1,
    moduleId: module13._id,
    xpReward: 35,
    duration: 20,
    contentType: "exercise",
    exercise: parseJSONContent("Module13_Datetime", "L1_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 13.2: Formatting and Parsing: strftime and strptime (.md + .json files) ---
  const m13L2Content = readContent(
    "Module13_Datetime",
    "L2_Formatting_Parsing.md"
  );
  if (!m13L2Content) {
    throw new Error("Failed to read L2_Formatting_Parsing.md");
  }

  await Lesson.create({
    title: "Formatting and Parsing: `strftime` and `strptime`",
    content: m13L2Content,
    shortDescription:
      "Learn to convert datetime objects to custom strings (`strftime`) and vice-versa (`strptime`).",
    order: 2,
    moduleId: module13._id,
    xpReward: 45,
    duration: 30,
    contentType: "exercise",
    exercise: parseJSONContent("Module13_Datetime", "L2_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 13.3: Date Arithmetic with timedelta (.md + .json files) ---
  const m13L3Content = readContent("Module13_Datetime", "L3_Timedelta.md");
  if (!m13L3Content) {
    throw new Error("Failed to read L3_Timedelta.md");
  }

  await Lesson.create({
    title: "Date Arithmetic with `timedelta`",
    content: m13L3Content,
    shortDescription:
      "Calculate date differences and manipulate dates using the `timedelta` object.",
    order: 3,
    moduleId: module13._id,
    xpReward: 40,
    duration: 25,
    contentType: "exercise",
    exercise: parseJSONContent("Module13_Datetime", "L3_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 13.4: Time Zones (tzinfo) and Conversion (.md + .json files) ---
  const m13L4Content = readContent("Module13_Datetime", "L4_Timezones.md");
  if (!m13L4Content) {
    throw new Error("Failed to read L4_Timezones.md");
  }

  await Lesson.create({
    title: "Time Zones (`tzinfo`) and Conversion",
    content: m13L4Content,
    shortDescription:
      "Understand the necessity of time zones and how to convert between them.",
    order: 4,
    moduleId: module13._id,
    xpReward: 35,
    duration: 20,
    contentType: "exercise",
    exercise: parseJSONContent("Module13_Datetime", "L4_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 13.5: Project: Event Timer and Date Validator ---
  const m13L5Content = readContent(
    "Module13_Datetime",
    "L5_Project_Event_Timer.md"
  );
  if (!m13L5Content) {
    throw new Error("Failed to read L5_Project_Event_Timer.md");
  }

  await Lesson.create({
    title: "Project: Event Timer and Date Validator",
    content: m13L5Content,
    shortDescription:
      "Final project: Build a utility to calculate the time remaining until a future event and validate user-input dates.",
    order: 5,
    moduleId: module13._id,
    xpReward: 55,
    duration: 35,
    contentType: "project",
    exercise: parseJSONContent("Module13_Datetime", "L5_Exercise.json"),
    isPublished: true,
  });

  console.log("✅ Module 13 completed: 5 lessons created");

  //  =======================================
  // || MODULE 14: REGULAR EXPRESSIONS (REGEX) ||
  //  =======================================
  console.log("📘 Creating Module 14: Regular Expressions...");
  const module14 = await Module.create({
    title: "Regular Expressions (Regex)",
    description:
      "Learn the powerful technique of Regular Expressions for advanced pattern matching, searching, and substitution in strings.",
    shortDescription: "Master the `re` module for complex text manipulation.",
    order: 14,
    difficulty: "intermediate",
    estimatedHours: 3.0,
    isPublished: true,
    prerequisites: module1_id ? [module1_id] : [],
    learningObjectives: [
      "Understand the basic syntax for regex patterns.",
      "Use the `re.search()` and `re.match()` functions.",
      "Apply quantifiers, character classes, and anchors.",
      "Extract data from text using capturing groups.",
      "Perform search and replace using `re.sub()`.",
    ],
    icon: "🔎",
    xpReward: 220,
  });

  // --- Lesson 14.1: Introduction to Regex Syntax and `re.search()` (.md + .json files) ---
  const m14L1Content = readContent("Module14_Regex", "L1_Regex_Basics.md");
  if (!m14L1Content) {
    throw new Error("Failed to read L1_Regex_Basics.md");
  }

  await Lesson.create({
    title: "Introduction to Regex Syntax and `re.search()`",
    content: m14L1Content,
    shortDescription:
      "Learn fundamental regex concepts, special characters, and how to use Python's primary matching function.",
    order: 1,
    moduleId: module14._id,
    xpReward: 40,
    duration: 25,
    contentType: "exercise",
    exercise: parseJSONContent("Module14_Regex", "L1_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 14.2: Quantifiers, Character Sets, and Anchors (.md + .json files) ---
  const m14L2Content = readContent("Module14_Regex", "L2_Advanced_Patterns.md");
  if (!m14L2Content) {
    throw new Error("Failed to read L2_Advanced_Patterns.md");
  }

  await Lesson.create({
    title: "Quantifiers, Character Sets, and Anchors",
    content: m14L2Content,
    shortDescription:
      "Master complex pattern building with `*`, `+`, `?`, `{}`, `[]`, and `^`/`$` symbols.",
    order: 2,
    moduleId: module14._id,
    xpReward: 50,
    duration: 35,
    contentType: "exercise",
    exercise: parseJSONContent("Module14_Regex", "L2_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 14.3: Capturing Groups and Data Extraction (.md + .json files) ---
  const m14L3Content = readContent("Module14_Regex", "L3_Capturing_Groups.md");
  if (!m14L3Content) {
    throw new Error("Failed to read L3_Capturing_Groups.md");
  }

  await Lesson.create({
    title: "Capturing Groups and Data Extraction",
    content: m14L3Content,
    shortDescription:
      "Use parentheses to isolate and extract specific parts of a matched string.",
    order: 3,
    moduleId: module14._id,
    xpReward: 45,
    duration: 30,
    contentType: "exercise",
    exercise: parseJSONContent("Module14_Regex", "L3_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 14.4: Substitution and Splitting with re.sub() and re.split() (.md + .json files) ---
  const m14L4Content = readContent("Module14_Regex", "L4_Sub_Split.md");
  if (!m14L4Content) {
    throw new Error("Failed to read L4_Sub_Split.md");
  }

  await Lesson.create({
    title: "Substitution and Splitting with `re.sub()` and `re.split()`",
    content: m14L4Content,
    shortDescription:
      "Perform powerful search-and-replace and text splitting operations using regex.",
    order: 4,
    moduleId: module14._id,
    xpReward: 40,
    duration: 25,
    contentType: "exercise",
    exercise: parseJSONContent("Module14_Regex", "L4_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 14.5: Project: Log File Analyzer (IP & Date Extractor) ---
  const m14L5Content = readContent(
    "Module14_Regex",
    "L5_Project_Log_Analyzer.md"
  );
  if (!m14L5Content) {
    throw new Error("Failed to read L5_Project_Log_Analyzer.md");
  }

  await Lesson.create({
    title: "Project: Log File Analyzer (IP & Date Extractor)",
    content: m14L5Content,
    shortDescription:
      "Final project: Use regex to parse and extract structured data (like IP addresses and timestamps) from a complex log file.",
    order: 5,
    moduleId: module14._id,
    xpReward: 75,
    duration: 40,
    contentType: "project",
    exercise: parseJSONContent("Module14_Regex", "L5_Exercise.json"),
    isPublished: true,
  });

  console.log("✅ Module 14 completed: 5 lessons created");

  //  =======================================
  // || MODULE 15: PYTHON TOOLING & ENVIRONMENT ||
  //  =======================================
  console.log("📘 Creating Module 15: Python Tooling...");
  const module15 = await Module.create({
    title: "Python Tooling & Environment",
    description:
      "Learn essential professional developer skills like managing dependencies, using virtual environments, and basic debugging practices.",
    shortDescription:
      "Master `pip`, `venv`, and fundamental debugging with `pdb`.",
    order: 15,
    difficulty: "intermediate",
    estimatedHours: 2.0,
    isPublished: true,
    prerequisites: module1_id ? [module1_id] : [],
    learningObjectives: [
      "Create and activate isolated virtual environments (`venv`).",
      "Use the `pip` package manager to install, list, and freeze dependencies.",
      "Understand the purpose of `requirements.txt`.",
      "Perform basic debugging using the built-in `pdb` module.",
      "Familiarize with code style guidelines (e.g., PEP 8).",
    ],
    icon: "⚙️",
    xpReward: 160,
  });

  // --- Lesson 15.1: Virtual Environments: venv (.md + .json files) ---
  const m15L1Content = readContent(
    "Module15_Tooling",
    "L1_Virtual_Environments.md"
  );
  if (!m15L1Content) {
    throw new Error("Failed to read L1_Virtual_Environments.md");
  }

  await Lesson.create({
    title: "Virtual Environments: `venv`",
    content: m15L1Content,
    shortDescription:
      "Understand why and how to isolate project dependencies using a virtual environment.",
    order: 1,
    moduleId: module15._id,
    xpReward: 30,
    duration: 15,
    contentType: "guided-setup",
    exercise: parseJSONContent("Module15_Tooling", "L1_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 15.2: Package Management with pip and requirements.txt (.md + .json files) ---
  const m15L2Content = readContent(
    "Module15_Tooling",
    "L2_Pip_Requirements.md"
  );
  if (!m15L2Content) {
    throw new Error("Failed to read L2_Pip_Requirements.md");
  }

  await Lesson.create({
    title: "Package Management with `pip` and `requirements.txt`",
    content: m15L2Content,
    shortDescription:
      "Learn to install, uninstall, and manage packages and share them via `requirements.txt`.",
    order: 2,
    moduleId: module15._id,
    xpReward: 35,
    duration: 20,
    contentType: "exercise",
    exercise: parseJSONContent("Module15_Tooling", "L2_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 15.3: Basic Debugging with pdb (.md + .json files) ---
  const m15L3Content = readContent("Module15_Tooling", "L3_Debugging_PDB.md");
  if (!m15L3Content) {
    throw new Error("Failed to read L3_Debugging_PDB.md");
  }

  await Lesson.create({
    title: "Basic Debugging with `pdb`",
    content: m15L3Content,
    shortDescription:
      "Step through code, inspect variables, and track execution flow using the Python Debugger.",
    order: 3,
    moduleId: module15._id,
    xpReward: 35,
    duration: 20,
    contentType: "exercise",
    exercise: parseJSONContent("Module15_Tooling", "L3_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 15.4: Project: Package Setup and Use ---
  const m15L4Content = readContent(
    "Module15_Tooling",
    "L4_Project_Package_Setup.md"
  );
  if (!m15L4Content) {
    throw new Error("Failed to read L4_Project_Package_Setup.md");
  }

  await Lesson.create({
    title: "Project: Package Setup and Use",
    content: m15L4Content,
    shortDescription:
      "Final project: Create a new project, set up a virtual environment, install a third-party package (e.g., `requests`), and use it.",
    order: 4,
    moduleId: module15._id,
    xpReward: 60,
    duration: 30,
    contentType: "project",
    exercise: parseJSONContent("Module15_Tooling", "L4_Exercise.json"),
    isPublished: true,
  });

  console.log("✅ Module 15 completed: 4 lessons created");
  console.log(
    "🎉 Modules 11-15 seeding completed! Total: 5 modules, 24 lessons"
  );

  return [module11, module12, module13, module14, module15];
};

module.exports = seedModules11to15;
