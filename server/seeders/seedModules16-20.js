// server/seeders/seedModules16-20.js
const seedModules16to20 = async (
  Lesson,
  Module,
  readContent,
  parseJSONContent,
  options = {},
  seedConfig = {}
) => {
  console.log("🚀 Seeding Modules 16-20 with config:", {
    batchSize: seedConfig.batchSize,
    modules: seedConfig.modules || "all",
  });

  // Extract module IDs from options with validation
  const {
    module2_id = null,
    module4_id = null,
    module5_id = null,
    module7_id = null,
    module16_id = null,
  } = options;

  // Validate required module IDs
  const missingPrerequisites = [];
  if (!module2_id) missingPrerequisites.push("module2_id");
  if (!module4_id) missingPrerequisites.push("module4_id");
  if (!module5_id) missingPrerequisites.push("module5_id");
  if (!module7_id) missingPrerequisites.push("module7_id");

  if (missingPrerequisites.length > 0) {
    console.warn("⚠️ Missing prerequisite module IDs:", missingPrerequisites);
  }

  // ======================================
  // || MODULE 16: HTTP REQUESTS & APIs ||
  // ======================================
  console.log("📘 Creating Module 16: HTTP Requests & APIs...");
  const module16 = await Module.create({
    title: "HTTP Requests & APIs",
    description:
      "Learn to interact with web services and retrieve data from the internet using the powerful `requests` library.",
    shortDescription:
      "Mastering the `requests` library for GET/POST requests and handling JSON data.",
    order: 16,
    difficulty: "advanced",
    estimatedHours: 4.0,
    isPublished: true,
    prerequisites: [module2_id, module5_id, module7_id].filter(Boolean),
    learningObjectives: [
      "Understand the basics of HTTP methods (GET, POST) and status codes.",
      "Use the `requests` library to make synchronous GET requests.",
      "Parse and handle data returned in JSON format.",
      "Construct and send data via POST requests.",
      "Handle common request errors and timeouts.",
    ],
    icon: "🌐",
    xpReward: 300,
  });

  // --- Lesson 16.1: HTTP Basics, Status Codes, and the `requests` Library ---
  const m16L1Content = readContent("Module16_API", "L1_HTTP_Basics.md");
  if (!m16L1Content) {
    throw new Error("Failed to read L1_HTTP_Basics.md");
  }

  await Lesson.create({
    title: "HTTP Basics and `requests` Library Setup",
    content: m16L1Content,
    shortDescription:
      "Introduction to client-server communication, HTTP status codes, and installing the `requests` library.",
    order: 1,
    moduleId: module16._id,
    xpReward: 50,
    duration: 30,
    contentType: "guided-setup",
    exercise: parseJSONContent("Module16_API", "L1_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 16.2: Making GET Requests and Query Parameters ---
  const m16L2Content = readContent("Module16_API", "L2_GET_Requests.md");
  if (!m16L2Content) {
    throw new Error("Failed to read L2_GET_Requests.md");
  }

  await Lesson.create({
    title: "Making GET Requests and Query Parameters",
    content: m16L2Content,
    shortDescription:
      "Learn how to fetch data from an endpoint and pass dynamic information using query parameters.",
    order: 2,
    moduleId: module16._id,
    xpReward: 60,
    duration: 45,
    contentType: "exercise",
    exercise: parseJSONContent("Module16_API", "L2_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 16.3: Handling JSON Data with .json() ---
  const m16L3Content = readContent("Module16_API", "L3_JSON_Handling.md");
  if (!m16L3Content) {
    throw new Error("Failed to read L3_JSON_Handling.md");
  }

  await Lesson.create({
    title: "Handling JSON Data with `.json()`",
    content: m16L3Content,
    shortDescription:
      "Converting API responses into usable Python Dictionaries and Lists for data access.",
    order: 3,
    moduleId: module16._id,
    xpReward: 60,
    duration: 45,
    contentType: "exercise",
    exercise: parseJSONContent("Module16_API", "L3_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 16.4: Sending Data with POST Requests and Authentication ---
  const m16L4Content = readContent("Module16_API", "L4_POST_Requests.md");
  if (!m16L4Content) {
    throw new Error("Failed to read L4_POST_Requests.md");
  }

  await Lesson.create({
    title: "Sending Data with POST Requests",
    content: m16L4Content,
    shortDescription:
      "How to create, send, and process data to a web service using the POST method.",
    order: 4,
    moduleId: module16._id,
    xpReward: 60,
    duration: 45,
    contentType: "exercise",
    exercise: parseJSONContent("Module16_API", "L4_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 16.5: Project: Simple API Client for Public Data ---
  const m16L5Content = readContent("Module16_API", "L5_Project_API_Client.md");
  if (!m16L5Content) {
    throw new Error("Failed to read L5_Project_API_Client.md");
  }

  await Lesson.create({
    title: "Project: Simple API Client for Public Data",
    content: m16L5Content,
    shortDescription:
      "Final project: Build a command-line tool that fetches, processes, and displays data from a public API.",
    order: 5,
    moduleId: module16._id,
    xpReward: 70,
    duration: 60,
    contentType: "project",
    exercise: parseJSONContent("Module16_API", "L5_Exercise.json"),
    isPublished: true,
  });

  console.log("✅ Module 16 completed: 5 lessons created");

  // ============================================================
  // || MODULE 17: INTRODUCTION TO DATA SCIENCE (NUMPY/PANDAS) ||
  // ============================================================
  console.log("📘 Creating Module 17: Data Science (NumPy/Pandas)...");
  const module17 = await Module.create({
    title: "Introduction to Data Science (NumPy/Pandas)",
    description:
      "A practical introduction to the fundamental libraries for data manipulation and analysis in Python.",
    shortDescription:
      "Working with NumPy Arrays and Pandas DataFrames/Series for data tasks.",
    order: 17,
    difficulty: "advanced",
    estimatedHours: 5.0,
    isPublished: true,
    prerequisites: [module2_id, module5_id, module4_id].filter(Boolean),
    learningObjectives: [
      "Understand the benefits of NumPy Arrays over Python lists.",
      "Perform basic array creation and mathematical operations using NumPy.",
      "Introduce the Pandas Series and DataFrame structures.",
      "Load, inspect, and perform basic cleaning on a DataFrame.",
      "Select and filter data using Pandas indexing.",
    ],
    icon: "📊",
    xpReward: 350,
  });

  // --- Lesson 17.1: NumPy Arrays and Why They Matter ---
  const m17L1Content = readContent(
    "Module17_DataScience",
    "L1_NumPy_Arrays.md"
  );
  if (!m17L1Content) {
    throw new Error("Failed to read L1_NumPy_Arrays.md");
  }

  await Lesson.create({
    title: "NumPy Arrays and Why They Matter",
    content: m17L1Content,
    shortDescription:
      "Introduction to the `ndarray`, its performance benefits, and basic creation/attributes (`shape`, `dtype`).",
    order: 1,
    moduleId: module17._id,
    xpReward: 62,
    duration: 40,
    contentType: "exercise",
    exercise: parseJSONContent("Module17_DataScience", "L1_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 17.2: Vectorized Operations and Aggregation ---
  const m17L2Content = readContent(
    "Module17_DataScience",
    "L2_NumPy_Vectorized.md"
  );
  if (!m17L2Content) {
    throw new Error("Failed to read L2_NumPy_Vectorized.md");
  }

  await Lesson.create({
    title: "Vectorized Operations and Aggregation",
    content: m17L2Content,
    shortDescription:
      "Performing fast, element-wise math on arrays and summarizing data with aggregation functions (`sum`, `mean`, `max`).",
    order: 2,
    moduleId: module17._id,
    xpReward: 62,
    duration: 40,
    contentType: "exercise",
    exercise: parseJSONContent("Module17_DataScience", "L2_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 17.3: Introduction to Pandas Series ---
  const m17L3Content = readContent(
    "Module17_DataScience",
    "L3_Pandas_Series.md"
  );
  if (!m17L3Content) {
    throw new Error("Failed to read L3_Pandas_Series.md");
  }

  await Lesson.create({
    title: "Introduction to Pandas Series",
    content: m17L3Content,
    shortDescription:
      "Understanding the labeled 1D Pandas Series structure and using label-based indexing.",
    order: 3,
    moduleId: module17._id,
    xpReward: 62,
    duration: 40,
    contentType: "exercise",
    exercise: parseJSONContent("Module17_DataScience", "L3_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 17.4: Working with Pandas DataFrames ---
  const m17L4Content = readContent(
    "Module17_DataScience",
    "L4_Pandas_DataFrames.md"
  );
  if (!m17L4Content) {
    throw new Error("Failed to read L4_Pandas_DataFrames.md");
  }

  await Lesson.create({
    title: "Working with Pandas DataFrames",
    content: m17L4Content,
    shortDescription:
      "Creating a 2D DataFrame, loading data, and inspecting structure (`head`, `shape`, `info`).",
    order: 4,
    moduleId: module17._id,
    xpReward: 62,
    duration: 40,
    contentType: "exercise",
    exercise: parseJSONContent("Module17_DataScience", "L4_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 17.5: Project: Data Selection and Filtering ---
  const m17L5Content = readContent(
    "Module17_DataScience",
    "L5_Project_Data_Filtering.md"
  );
  if (!m17L5Content) {
    throw new Error("Failed to read L5_Project_Data_Filtering.md");
  }

  await Lesson.create({
    title: "Project: Data Selection and Filtering",
    content: m17L5Content,
    shortDescription:
      "Project applying column selection and advanced Boolean filtering to subset a dataset.",
    order: 5,
    moduleId: module17._id,
    xpReward: 100,
    duration: 60,
    contentType: "project",
    exercise: parseJSONContent("Module17_DataScience", "L5_Exercise.json"),
    isPublished: true,
  });

  console.log("✅ Module 17 completed: 5 lessons created");

  // ====================================
  // || MODULE 18: WEB SCRAPING BASICS ||
  // ====================================
  console.log("📘 Creating Module 18: Web Scraping Basics...");
  const module18 = await Module.create({
    title: "Web Scraping Basics",
    description:
      "Discover how to programmatically extract structured data from websites using the `requests` and `BeautifulSoup` libraries.",
    shortDescription: "Extracting data using HTML structure and CSS selectors.",
    order: 18,
    difficulty: "advanced",
    estimatedHours: 3.5,
    isPublished: true,
    prerequisites: [module16._id],
    learningObjectives: [
      "Understand the structure of HTML and the DOM.",
      "Use the `requests` library to fetch HTML content.",
      "Introduce the `BeautifulSoup` library for parsing HTML.",
      "Locate and extract data using tags, classes, and IDs.",
      "Apply basic web scraping etiquette (e.g., respecting `robots.txt`).",
    ],
    icon: "🕸️",
    xpReward: 280,
  });

  // --- Lesson 18.1: HTML Structure and the DOM ---
  const m18L1Content = readContent(
    "Module18_Scraping",
    "L1_Introduction to HTML.md"
  );
  if (!m18L1Content) {
    throw new Error("Failed to read L1_Introduction to HTML.md");
  }

  await Lesson.create({
    title: "HTML Structure and the DOM",
    content: m18L1Content,
    shortDescription:
      "Introduction to HTML tags, attributes, and the hierarchical Document Object Model.",
    order: 1,
    moduleId: module18._id,
    xpReward: 52,
    duration: 35,
    contentType: "exercise",
    exercise: parseJSONContent("Module18_Scraping", "L1_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 18.2: Fetching HTML Content with `requests` ---
  const m18L2Content = readContent("Module18_Scraping", "L2_Requests.md");
  if (!m18L2Content) {
    throw new Error("Failed to read L2_Requests.md");
  }

  await Lesson.create({
    title: "Fetching HTML Content with `requests`",
    content: m18L2Content,
    shortDescription:
      "Using `requests.get()` and custom headers to retrieve the raw webpage source.",
    order: 2,
    moduleId: module18._id,
    xpReward: 52,
    duration: 35,
    contentType: "exercise",
    exercise: parseJSONContent("Module18_Scraping", "L2_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 18.3: Parsing HTML with `BeautifulSoup` ---
  const m18L3Content = readContent("Module18_Scraping", "L3_BeautifulSoup.md");
  if (!m18L3Content) {
    throw new Error("Failed to read L3_BeautifulSoup.md");
  }

  await Lesson.create({
    title: "Parsing HTML with `BeautifulSoup`",
    content: m18L3Content,
    shortDescription:
      "Converting raw HTML into a navigable Python object using the `BeautifulSoup` library.",
    order: 3,
    moduleId: module18._id,
    xpReward: 52,
    duration: 35,
    contentType: "exercise",
    exercise: parseJSONContent("Module18_Scraping", "L3_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 18.4: Locating Data with Class and ID ---
  const m18L4Content = readContent("Module18_Scraping", "L4_Class_Id.md");
  if (!m18L4Content) {
    throw new Error("Failed to read L4_Class_Id.md");
  }

  await Lesson.create({
    title: "Locating Data with Class and ID",
    content: m18L4Content,
    shortDescription:
      "Targeting elements precisely using the `id` and `class_` keyword arguments.",
    order: 4,
    moduleId: module18._id,
    xpReward: 52,
    duration: 35,
    contentType: "exercise",
    exercise: parseJSONContent("Module18_Scraping", "L4_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 18.5: Project: Basic Web Scraping Etiquette and Data Storage ---
  const m18L5Content = readContent(
    "Module18_Scraping",
    "L5_Project_Basic Web Scraping.md"
  );
  if (!m18L5Content) {
    throw new Error("Failed to read L5_Project_Basic Web Scraping.md");
  }

  await Lesson.create({
    title: "Project: Basic Web Scraping Etiquette and Data Storage",
    content: m18L5Content,
    shortDescription:
      "Project applying scraping, respecting `robots.txt`, and saving extracted data to a file.",
    order: 5,
    moduleId: module18._id,
    xpReward: 70,
    duration: 50,
    contentType: "project",
    exercise: parseJSONContent("Module18_Scraping", "L5_Exercise.json"),
    isPublished: true,
  });

  console.log("✅ Module 18 completed: 5 lessons created");

  // ===========================================
  // || MODULE 19: DATABASE INTERACTION (SQL) ||
  // ===========================================
  console.log("📘 Creating Module 19: Database Interaction (SQL)...");
  const module19 = await Module.create({
    title: "Database Interaction (SQL)",
    description:
      "Integrate your Python applications with relational databases using the built-in `sqlite3` module for persistent data storage.",
    shortDescription:
      "Connecting, executing SQL queries, and managing data with Python.",
    order: 19,
    difficulty: "advanced",
    estimatedHours: 3.0,
    isPublished: true,
    prerequisites: module7_id ? [module7_id] : [],
    learningObjectives: [
      "Understand the basics of relational databases and SQL.",
      "Connect to an SQLite database using `sqlite3`.",
      "Execute SQL queries (CREATE, INSERT, SELECT, UPDATE, DELETE).",
      "Use parameterized queries to prevent SQL Injection.",
      "Fetch and process query results in Python.",
    ],
    icon: "💾",
    xpReward: 260,
  });

  // --- Lesson 19.1: Database Basics and Connecting with `sqlite3` ---
  const m19L1Content = readContent(
    "Module19_Database",
    "L1_Database_Basics.md"
  );
  if (!m19L1Content) {
    throw new Error("Failed to read L1_Database_Basics.md");
  }

  await Lesson.create({
    title: "Database Basics and Connecting with `sqlite3`",
    content: m19L1Content,
    shortDescription:
      "Introduction to relational tables, the built-in `sqlite3` module, and establishing a connection.",
    order: 1,
    moduleId: module19._id,
    xpReward: 63,
    duration: 30,
    contentType: "exercise",
    exercise: parseJSONContent("Module19_Database", "L1_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 19.2: Creating Tables and Inserting Data (CREATE/INSERT) ---
  const m19L2Content = readContent("Module19_Database", "L2_CREATE_INSERT.md");
  if (!m19L2Content) {
    throw new Error("Failed to read L2_CREATE_INSERT.md");
  }

  await Lesson.create({
    title: "Creating Tables and Inserting Data (CREATE/INSERT)",
    content: m19L2Content,
    shortDescription:
      "Executing SQL commands to define schema and populate the database, focusing on `commit()`.",
    order: 2,
    moduleId: module19._id,
    xpReward: 63,
    duration: 30,
    contentType: "exercise",
    exercise: parseJSONContent("Module19_Database", "L2_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 19.3: Retrieving Data with SELECT and Cursors ---
  const m19L3Content = readContent("Module19_Database", "L3_SELECT_Data.md");
  if (!m19L3Content) {
    throw new Error("Failed to read L3_SELECT_Data.md");
  }

  await Lesson.create({
    title: "Retrieving Data with SELECT and Cursors",
    content: m19L3Content,
    shortDescription:
      "Running query commands and using the cursor's `fetchone()`, `fetchall()`, and `for` loop methods.",
    order: 3,
    moduleId: module19._id,
    xpReward: 64,
    duration: 30,
    contentType: "exercise",
    exercise: parseJSONContent("Module19_Database", "L3_Exercise.json"),
    isPublished: true,
  });

  // --- Lesson 19.4: Project: Parameterized Queries and Updating Data (UPDATE/DELETE) ---
  const m19L4Content = readContent("Module19_Database", "L4_Project_CRUD.md");
  if (!m19L4Content) {
    throw new Error("Failed to read L4_Project_CRUD.md");
  }

  await Lesson.create({
    title: "Project: Parameterized Queries and Updating Data",
    content: m19L4Content,
    shortDescription:
      "Project focusing on data modification (UPDATE, DELETE) and securing queries with placeholders.",
    order: 4,
    moduleId: module19._id,
    xpReward: 70,
    duration: 45,
    contentType: "project",
    exercise: parseJSONContent("Module19_Database", "L4_Exercise.json"),
    isPublished: true,
  });

  console.log("✅ Module 19 completed: 4 lessons created");

  // =================================================
  // || MODULE 20: FINAL PROJECT: COMMAND LINE TOOL ||
  // =================================================
  console.log("📘 Creating Module 20: Final Project...");
  const module20 = await Module.create({
    title: "Final Project: Command Line Tool",
    description:
      "Apply all concepts from the course to build a fully functional, self-contained utility that runs from the command line.",
    shortDescription:
      "Integrate I/O, Data Structures, APIs, and tooling into one practical application.",
    order: 20,
    difficulty: "advanced",
    estimatedHours: 6.0,
    isPublished: true,
    prerequisites: [module16._id, module17._id, module18._id, module19._id],
    learningObjectives: [
      "Design and structure a multi-file Python application.",
      "Utilize the `argparse` module for command-line argument handling.",
      "Integrate data persistence (e.g., file I/O or database).",
      "Demonstrate clean, well-documented, and modular code.",
      "Complete a significant, portfolio-ready project.",
    ],
    icon: "🏆",
    xpReward: 500,
  });

  const m20L1Content = readContent("Module20_Project", "L1_Final_Project.md");
  if (!m20L1Content) {
    throw new Error("Failed to read L1_Final_Project.md");
  }

  await Lesson.create({
    title: "Phase 3 Final Project: Command Line Utility",
    content: m20L1Content,
    shortDescription:
      "Detailed project brief for the final deliverable: a file organizer, simple task manager, or API dashboard.",
    order: 1,
    moduleId: module20._id,
    xpReward: 500,
    duration: 360,
    contentType: "project",
    exercise: parseJSONContent("Module20_Project", "L1_Final_Project.json"),
    isPublished: true,
  });

  console.log("✅ Module 20 completed: 1 comprehensive project");
  console.log(
    "🎉 Modules 16-20 seeding completed! Total: 5 modules, 20 lessons"
  );

  return [module16, module17, module18, module19, module20];
};

module.exports = seedModules16to20;
