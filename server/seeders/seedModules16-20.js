// server/seeders/seedModules16-20.js
const { prepareQuizData, loadLessonAsset } = require("../utils/seederHelpers");

const seedModules16to20 = async (
  Lesson,
  Module,
  readContent,
  parseJSONContent,
  options = {},
  seedConfig = {},
) => {
  console.log("🚀 Seeding Modules 16-20 with config:", {
    batchSize: seedConfig.batchSize,
    modules: seedConfig.modules || "all",
  });

  // Only need the immediate prerequisite (Module 15)
  const { module15_id = null } = options;

  //  ======================================
  // || MODULE 16: HTTP REQUESTS & APIs ||
  //  ======================================
  console.log("📘 Creating Module 16: HTTP Requests & APIs...");
  const m16Folder = "Module16_API";
  const m16ReviewQuiz = parseJSONContent(m16Folder, "M16_ReviewQuiz.json");
  const module16 = await Module.create({
    title: "HTTP Requests & APIs",
    description:
      "Learn to interact with web services using the powerful requests library.",
    shortDescription: "Master GET/POST requests and handling JSON data.",
    order: 16,
    moduleNumber: "M16",
    difficulty: "advanced",
    estimatedHours: 4.0,
    isPublished: true,
    prerequisites: module15_id ? [module15_id] : [],
    learningObjectives: [
      "HTTP Methods",
      "JSON Parsing",
      "Status Codes",
      "Error Handling",
    ],
    icon: "🌐",
    xpReward: 300,
    moduleQuiz: prepareQuizData(m16ReviewQuiz),
  });

  const m16Lessons = [
    {
      file: "L1_HTTP_Basics.md",
      quiz: "L1_Quiz.json",
      title: "HTTP Basics and Library Setup",
      type: "guided-setup",
      ex: "L1_Exercise.json",
    },
    {
      file: "L2_GET_Requests.md",
      quiz: "L2_Quiz.json",
      title: "Making GET Requests",
      type: "exercise",
      ex: "L2_Exercise.json",
    },
    {
      file: "L3_JSON_Handling.md",
      quiz: "L3_Quiz.json",
      title: "Handling JSON Data",
      type: "exercise",
      ex: "L3_Exercise.json",
    },
    {
      file: "L4_POST_Requests.md",
      quiz: "L4_Quiz.json",
      title: "Sending Data with POST",
      type: "exercise",
      ex: "L4_Exercise.json",
    },
    {
      file: "L5_Project_API_Client.md",
      title: "Project: Simple API Client",
      type: "project",
      ex: "L5_Exercise.json",
    },
  ];

  for (let i = 0; i < m16Lessons.length; i++) {
    const l = m16Lessons[i];
    await Lesson.create({
      title: l.title,
      content: readContent(m16Folder, l.file),
      order: i + 1,
      moduleId: module16._id,
      contentType: l.type,
      quiz: loadLessonAsset(parseJSONContent, m16Folder, l.quiz, "quiz"),
      exercise: loadLessonAsset(parseJSONContent, m16Folder, l.ex, "exercise"),
      isPublished: true,
    });
  }

  //  ============================================================
  // || MODULE 17: INTRODUCTION TO DATA SCIENCE (NUMPY/PANDAS) ||
  //  ============================================================
  console.log("📘 Creating Module 17: Data Science...");
  const m17Folder = "Module17_DataScience";
  const m17ReviewQuiz = parseJSONContent(m17Folder, "M17_ReviewQuiz.json");
  const module17 = await Module.create({
    title: "Introduction to Data Science (NumPy/Pandas)",
    description: "Practical introduction to data manipulation and analysis.",
    shortDescription: "Working with NumPy Arrays and Pandas DataFrames.",
    order: 17,
    moduleNumber: "M17",
    difficulty: "advanced",
    estimatedHours: 5.0,
    isPublished: true,
    prerequisites: [module16._id],
    learningObjectives: [
      "NumPy ndarrays",
      "Vectorized math",
      "Pandas DataFrames",
      "Data Filtering",
    ],
    icon: "📊",
    xpReward: 350,
    moduleQuiz: prepareQuizData(m17ReviewQuiz),
  });

  const m17Lessons = [
    {
      file: "L1_NumPy_Arrays.md",
      quiz: "L1_Quiz.json",
      title: "NumPy Arrays Basics",
      type: "exercise",
      ex: "L1_Exercise.json",
    },
    {
      file: "L2_NumPy_Vectorized.md",
      quiz: "L2_Quiz.json",
      title: "Vectorized Operations",
      type: "exercise",
      ex: "L2_Exercise.json",
    },
    {
      file: "L3_Pandas_Series.md",
      quiz: "L3_Quiz.json",
      title: "Pandas Series",
      type: "exercise",
      ex: "L3_Exercise.json",
    },
    {
      file: "L4_Pandas_DataFrames.md",
      quiz: "L4_Quiz.json",
      title: "Working with DataFrames",
      type: "exercise",
      ex: "L4_Exercise.json",
    },
    {
      file: "L5_Project_Data_Filtering.md",
      title: "Project: Data Selection and Filtering",
      type: "project",
      ex: "L5_Exercise.json",
    },
  ];

  for (let i = 0; i < m17Lessons.length; i++) {
    const l = m17Lessons[i];
    await Lesson.create({
      title: l.title,
      content: readContent(m17Folder, l.file),
      order: i + 1,
      moduleId: module17._id,
      contentType: l.type,
      quiz: loadLessonAsset(parseJSONContent, m17Folder, l.quiz, "quiz"),
      exercise: loadLessonAsset(parseJSONContent, m17Folder, l.ex, "exercise"),
      isPublished: true,
    });
  }

  //  ====================================
  // || MODULE 18: WEB SCRAPING BASICS ||
  //  ====================================
  console.log("📘 Creating Module 18: Web Scraping...");
  const m18Folder = "Module18_Scraping";
  const m18ReviewQuiz = parseJSONContent(m18Folder, "M18_ReviewQuiz.json");
  const module18 = await Module.create({
    title: "Web Scraping Basics",
    description: "Extract structured data from websites using BeautifulSoup.",
    shortDescription: "Extracting data using HTML structure and CSS selectors.",
    order: 18,
    moduleNumber: "M18",
    difficulty: "advanced",
    estimatedHours: 3.5,
    isPublished: true,
    prerequisites: [module17._id],
    learningObjectives: [
      "HTML/DOM",
      "Parsing with BS4",
      "CSS Selectors",
      "Scraping Etiquette",
    ],
    icon: "🕸️",
    xpReward: 280,
    moduleQuiz: prepareQuizData(m18ReviewQuiz),
  });

  const m18Lessons = [
    {
      file: "L1_Introduction to HTML.md",
      quiz: "L1_Quiz.json",
      title: "HTML Structure and the DOM",
      type: "exercise",
      ex: "L1_Exercise.json",
    },
    {
      file: "L2_Requests.md",
      quiz: "L2_Quiz.json",
      title: "Fetching HTML with Requests",
      type: "exercise",
      ex: "L2_Exercise.json",
    },
    {
      file: "L3_BeautifulSoup.md",
      quiz: "L3_Quiz.json",
      title: "Parsing with BeautifulSoup",
      type: "exercise",
      ex: "L3_Exercise.json",
    },
    {
      file: "L4_Class_Id.md",
      quiz: "L4_Quiz.json",
      title: "Locating Data with Class and ID",
      type: "exercise",
      ex: "L4_Exercise.json",
    },
    {
      file: "L5_Project_Basic Web Scraping.md",
      title: "Project: Data Extraction and Storage",
      type: "project",
      ex: "L5_Exercise.json",
    },
  ];

  for (let i = 0; i < m18Lessons.length; i++) {
    const l = m18Lessons[i];
    await Lesson.create({
      title: l.title,
      content: readContent(m18Folder, l.file),
      order: i + 1,
      moduleId: module18._id,
      contentType: l.type,
      quiz: loadLessonAsset(parseJSONContent, m18Folder, l.quiz, "quiz"),
      exercise: loadLessonAsset(parseJSONContent, m18Folder, l.ex, "exercise"),
      isPublished: true,
    });
  }

  //  ===========================================
  // || MODULE 19: DATABASE INTERACTION (SQL) ||
  //  ===========================================
  console.log("📘 Creating Module 19: Databases...");
  const m19Folder = "Module19_Database";
  const m19ReviewQuiz = parseJSONContent(m19Folder, "M19_ReviewQuiz.json");
  const module19 = await Module.create({
    title: "Database Interaction (SQL)",
    description:
      "Integrate Python applications with SQLite for persistent storage.",
    shortDescription: "Connecting, executing queries, and managing SQL data.",
    order: 19,
    moduleNumber: "M19",
    difficulty: "advanced",
    estimatedHours: 3.0,
    isPublished: true,
    prerequisites: [module18._id],
    learningObjectives: [
      "SQL Basics",
      "sqlite3 module",
      "CRUD Operations",
      "Parameterized Queries",
    ],
    icon: "💾",
    xpReward: 260,
    moduleQuiz: prepareQuizData(m19ReviewQuiz),
  });

  const m19Lessons = [
    {
      file: "L1_Database_Basics.md",
      quiz: "L1_Quiz.json",
      title: "DB Basics and Connecting",
      type: "exercise",
      ex: "L1_Exercise.json",
    },
    {
      file: "L2_CREATE_INSERT.md",
      quiz: "L2_Quiz.json",
      title: "Creating Tables and Inserting",
      type: "exercise",
      ex: "L2_Exercise.json",
    },
    {
      file: "L3_SELECT_Data.md",
      quiz: "L3_Quiz.json",
      title: "Retrieving Data with Cursors",
      type: "exercise",
      ex: "L3_Exercise.json",
    },
    {
      file: "L4_Project_CRUD.md",
      title: "Project: Parameterized Queries and Updates",
      type: "project",
      ex: "L4_Exercise.json",
    },
  ];

  for (let i = 0; i < m19Lessons.length; i++) {
    const l = m19Lessons[i];
    await Lesson.create({
      title: l.title,
      content: readContent(m19Folder, l.file),
      order: i + 1,
      moduleId: module19._id,
      contentType: l.type,
      quiz: loadLessonAsset(parseJSONContent, m19Folder, l.quiz, "quiz"),
      exercise: loadLessonAsset(parseJSONContent, m19Folder, l.ex, "exercise"),
      isPublished: true,
    });
  }

  //  =================================================
  // || MODULE 20: FINAL PROJECT: COMMAND LINE TOOL ||
  //  =================================================
  console.log("📘 Creating Module 20: Final Project...");
  const m20Folder = "Module20_Project";
  const module20 = await Module.create({
    title: "Final Project: Command Line Tool",
    description: "Build a fully functional, portfolio-ready CLI application.",
    shortDescription: "Integrating APIs, Data, and SQL into one utility.",
    order: 20,
    moduleNumber: "M20",
    difficulty: "advanced",
    estimatedHours: 6.0,
    isPublished: true,
    prerequisites: [module19._id],
    learningObjectives: [
      "App Design",
      "argparse",
      "Tool Integration",
      "Clean Code",
    ],
    icon: "🏆",
    xpReward: 500,
  });

  await Lesson.create({
    title: "Phase 3 Final Project: Command Line Utility",
    content: readContent(m20Folder, "L1_Final_Project.md"),
    order: 1,
    moduleId: module20._id,
    contentType: "project",
    exercise: loadLessonAsset(
      parseJSONContent,
      m20Folder,
      "L1_Final_Project.json",
      "exercise",
    ),
    isPublished: true,
  });

  console.log("🎉 Modules 16-20 seeding completed!");
  return [module16, module17, module18, module19, module20];
};

module.exports = seedModules16to20;
