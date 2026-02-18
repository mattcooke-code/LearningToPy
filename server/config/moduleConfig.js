// server/config/moduleConfigs.js
/**
 * Centralized module configuration for seeding and updating
 *
 * This file contains the structure of all curriculum modules.
 * Used by:
 * - updateCurriculum.js (selective updates)
 * - Future tools (analytics, migration scripts, etc.)
 */

const MODULE_CONFIGS = {
  M0: {
    folder: "Module0_Tutorial",
    title: "Interactive Tutorial",
    description:
      "Learn how to use this learning platform and get familiar with the coding environment.",
    lessons: [
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
        file: "L6_Coding_Locally.md",
        quiz: "L6_Quiz.json",
        title: "Coding Locally",
        type: "theory",
      },
      {
        file: "L7_First_Exercise.md",
        title: "Your First Python Program",
        type: "exercise",
        ex: "L7_Exercise.json",
      },
    ],
  },

  M1: {
    folder: "Module1_Fundamentals",
    title: "Python Fundamentals",
    description:
      "Learn the basics of Python programming including variables, data types, and basic operations.",
    lessons: [
      {
        file: "L1_Welcome.md",
        quiz: "L1_Quiz.json",
        title: "Welcome to Python",
        type: "theory",
        ex: "L1_Exercise.json",
      },
      {
        file: "L2_Variables.md",
        quiz: "L2_Quiz.json",
        title: "Variables: The Labelled Box",
        type: "exercise",
        ex: "L2_Exercise.json",
      },
      {
        file: "L3_Data_Types.md",
        quiz: "L3_Quiz.json",
        title: "Basic Data Types",
        type: "exercise",
        ex: "L3_Exercise.json",
      },
      {
        file: "L4_Operators.md",
        quiz: "L4_Quiz.json",
        title: "Operators: Manipulating Data",
        type: "exercise",
        ex: "L4_Exercise.json",
      },
      {
        file: "L5_StringFormatting.md",
        quiz: "L5_Quiz.json",
        title: "F-Strings: The Modern Way to Format Text",
        type: "exercise",
        ex: "L5_Exercise.json",
      },
      {
        file: "L6_Project_Calculator.md",
        title: "Module Project: Simple Calculator",
        type: "project",
        ex: "L6_Exercise.json",
      },
    ],
  },

  M2: {
    folder: "Module2_DataStructures",
    title: "Data Structures: Lists & Tuples",
    description:
      "Explore Python's ordered and sequential structures: mutable Lists and immutable Tuples.",
    lessons: [
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
    ],
  },

  M3: {
    folder: "Module3_ControlFlow",
    title: "Control Flow: Conditionals",
    description:
      "Learn how to make decisions in your code using if, elif, and else statements.",
    lessons: [
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
        file: "L6_Project_Gaming_Platform.md",
        title: "Module Project: Gaming Platform Access Control",
        type: "project",
        ex: "L6_Exercise.json",
      },
    ],
  },

  M4: {
    folder: "Module4_Iteration",
    title: "Iteration",
    description:
      "Learn how to automate repetitive tasks using for and while loops.",
    lessons: [
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
        file: "L6_Project_Cargo_Manager.md",
        title: "Module Project: Cargo Manager",
        type: "project",
        ex: "L6_Exercise.json",
      },
    ],
  },

  M5: {
    folder: "Module5_DataStructures",
    title: "Data Structures: Dictionaries & Sets",
    description: "Explore unordered data types: Dictionaries and Sets.",
    lessons: [
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
        file: "L6_Project_World_Explorer.md",
        title: "Module Project: World Explorer Research Tool",
        type: "project",
        ex: "L6_Exercise.json",
      },
    ],
  },

  M6: {
    folder: "Module6_Functions",
    title: "Functions",
    description:
      "Learn how to break code into reusable blocks, manage parameters, and control scope.",
    lessons: [
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
    ],
  },
  M7: {
    folder: "Module7_File_IO",
    title: "File I/O Basics",
    description:
      "Master reading from and writing to local files for data processing and persistence.",
    lessons: [
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
    ],
  },
  M8: {
    folder: "Module8_Error_Handling",
    title: "Error Handling: Try/Except",
    description:
      "Learn to write robust Python code that gracefully handles errors without crashing.",
    lessons: [
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
    ],
  },
  M9: {
    folder: "Module9_Comprehensions",
    title: "List/Dict Comprehensions",
    description:
      "Master Python's concise syntax for creating lists and dictionaries with elegant one-liners.",
    lessons: [
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
    ],
  },
  M10: {
    folder: "Module10_Advanced_Functions",
    title: "Advanced Functions",
    description:
      "Master lambda functions, decorators, flexible arguments, and functional programming.",
    lessons: [
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
    ],
  },
  M11: {
    folder: "Module11_OOP1",
    title: "Object-Oriented Programming (OOP) I",
    description:
      "Understand the core principles of OOP—Encapsulation, Abstraction, and custom types.",
    lessons: [
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
    ],
  },
  M12: {
    folder: "Module12_OOP2",
    title: "OOP II: Inheritance & Polymorphism",
    description:
      "Advance your OOP skills by implementing relationships between classes.",
    lessons: [
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
    ],
  },
  M13: {
    folder: "Module13_Datetime",
    title: "Working with Dates & Time",
    description:
      "Learn to handle and manipulate date, time, and timezone information.",
    lessons: [
      {
        file: "L1_Datetime_Basics.md",
        quiz: "L1_Quiz.json",
        title: "The datetime module",
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
    ],
  },
  M14: {
    folder: "Module14_Regex",
    title: "Regular Expressions (Regex)",
    description: "Learn powerful pattern matching and substitution in strings.",
    lessons: [
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
    ],
  },
  M15: {
    folder: "Module15_Tooling",
    title: "Professional Python Development",
    description:
      "Master the tools, structure, and practices used in real-world Python development - from virtual environments to building installable packages.",
    lessons: [
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
        file: "L4_Organising_Projects.md",
        quiz: "L4_Quiz.json",
        title: "Organising Python Projects",
        description:
          "Learn how to structure multi-file projects using modules and packages.",
        type: "exercise",
        ex: "L4_Exercise.json",
      },

      {
        file: "L5_Creating_Importing_Packages.md",
        quiz: "L5_Quiz.json",
        title: "Creating and Importing Packages",
        description:
          "Build your own installable Python packages with setup.py.",
        type: "exercise",
        ex: "L5_Exercise.json",
      },

      {
        file: "L6_Project_Package_Setup.md",
        title: "Project: Professional CLI Tool",
        description:
          "Build a production-ready, multi-file CLI tool and package it for installation.",
        type: "project",
        ex: "L6_Exercise.json",
      },
    ],
  },

  M16: {
    folder: "Module16_API",
    title: "HTTP Requests & APIs",
    description:
      "Learn to interact with web services using the powerful requests library.",
    lessons: [
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
    ],
  },

  M17: {
    folder: "Module17_DataScience",
    title: "Introduction to Data Science (NumPy/Pandas)",
    description: "Practical introduction to data manipulation and analysis.",
    lessons: [
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
    ],
  },

  M18: {
    folder: "Module18_Scraping",
    title: "Web Scraping Basics",
    description: "Extract structured data from websites using BeautifulSoup.",
    lessons: [
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
    ],
  },

  M19: {
    folder: "Module19_Database",
    title: "Database Interaction (SQL)",
    description:
      "Integrate Python applications with SQLite for persistent storage.",
    lessons: [
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
    ],
  },

  M20: {
    folder: "Module20_Project",
    title: "Final Project: Command Line Tool",
    description: "Build a fully functional, portfolio-ready CLI application.",
    lessons: [
      {
        file: "L1_Final_Project.md",
        title: "Phase 3 Final Project: Command Line Utility",
        type: "project",
        ex: "L1_Final_Project.json",
      },
    ],
  },
};

// Helper functions to use in seeders
const MODULE_HELPERS = {
  /**
   * Get module-specific metadata (XP, difficulty, etc.)
   * This can be extended based on your needs
   */
  getModuleMetadata: (moduleNum) => {
    const metadataMap = {
      M1: {
        difficulty: "beginner",
        estimatedHours: 3,
        xpReward: 100,
        icon: "🐍",
      },
      M2: {
        difficulty: "beginner",
        estimatedHours: 2.5,
        xpReward: 150,
        icon: "📊",
      },
      M3: {
        difficulty: "beginner",
        estimatedHours: 2,
        xpReward: 120,
        icon: "🚥",
      },
      M4: {
        difficulty: "beginner",
        estimatedHours: 2.5,
        xpReward: 130,
        icon: "🔁",
      },
      M5: {
        difficulty: "beginner",
        estimatedHours: 2.5,
        xpReward: 170,
        icon: "📖",
      },
      M6: {
        difficulty: "beginner",
        estimatedHours: 3,
        xpReward: 180,
        icon: "⚙️",
      },
      M7: {
        difficulty: "beginner",
        estimatedHours: 2.5,
        xpReward: 160,
        icon: "📁",
      },
      M8: {
        difficulty: "beginner",
        estimatedHours: 2.5,
        xpReward: 140,
        icon: "🛡️",
      },
      M9: {
        difficulty: "beginner",
        estimatedHours: 2.5,
        xpReward: 150,
        icon: "✨",
      },
      M10: {
        difficulty: "intermediate",
        estimatedHours: 3,
        xpReward: 180,
        icon: "🎯",
      },
      M11: {
        difficulty: "intermediate",
        estimatedHours: 3,
        xpReward: 200,
        icon: "🏗️",
      },
      M12: {
        difficulty: "intermediate",
        estimatedHours: 3,
        xpReward: 210,
        icon: "🧬",
      },
      M13: {
        difficulty: "intermediate",
        estimatedHours: 2.5,
        xpReward: 160,
        icon: "📅",
      },
      M14: {
        difficulty: "intermediate",
        estimatedHours: 3,
        xpReward: 170,
        icon: "🔍",
      },
      M15: {
        difficulty: "intermediate",
        estimatedHours: 4,
        xpReward: 250,
        icon: "🛠️",
      },
      M16: {
        difficulty: "advanced",
        estimatedHours: 4,
        xpReward: 300,
        icon: "🌐",
      },
      M17: {
        difficulty: "advanced",
        estimatedHours: 5,
        xpReward: 350,
        icon: "📊",
      },
      M18: {
        difficulty: "advanced",
        estimatedHours: 3.5,
        xpReward: 280,
        icon: "🕸️",
      },
      M19: {
        difficulty: "advanced",
        estimatedHours: 3,
        xpReward: 260,
        icon: "💾",
      },
      M20: {
        difficulty: "advanced",
        estimatedHours: 6,
        xpReward: 500,
        icon: "🏆",
      },
    };

    return (
      metadataMap[moduleNum] || {
        difficulty: "beginner",
        estimatedHours: 2,
        xpReward: 100,
        icon: "📚",
      }
    );
  },

  /**
   * Get learning objectives for a module
   * Now complete for ALL modules M1-M20
   */
  getLearningObjectives: (moduleNum) => {
    const objectivesMap = {
      //  🔴 PHASE 1: Python Fundamentals (M1-9)
      M1: [
        "Understand Python syntax and basic concepts",
        "Work with variables and data types",
        "Write and run your first Python program",
      ],
      M2: [
        "Understand and use lists and tuples",
        "Differentiate between mutable and immutable",
        "Perform indexing and slicing",
      ],
      M3: [
        "Write conditional logic with if/elif/else",
        "Use comparison and logical operators",
        "Understand truthiness and ternary expressions",
      ],
      M4: [
        "Master for loops and while loops",
        "Use range() for counting and stepping",
        "Control flow with break and continue",
      ],
      M5: [
        "Manipulate dictionaries and sets",
        "Perform set operations",
        "Choose the right data structure",
      ],
      M6: [
        "Define and call functions with parameters",
        "Understand positional vs keyword arguments",
        "Differentiate between local and global scope",
        "Return values from functions effectively",
        "Build reusable function-based programs",
      ],
      M7: [
        "Open and read text files using open() and read()",
        "Process files line by line with readlines()",
        "Implement context managers with 'with' statements",
        "Write and append data to files",
        "Build a log file processor application",
      ],
      M8: [
        "Identify and differentiate syntax errors from exceptions",
        "Handle runtime errors using try/except blocks",
        "Catch and handle specific exception types",
        "Implement else and finally clauses",
        "Raise exceptions intentionally for validation",
        "Build robust applications that fail gracefully",
      ],
      M9: [
        "Transform lists using comprehension syntax",
        "Apply conditional logic within comprehensions",
        "Create dictionaries using comprehension patterns",
        "Write nested comprehensions for complex data",
        "Know when comprehensions improve vs harm readability",
        "Build data transformation pipelines",
      ],

      // 🟡 PHASE 2: Intermediate Python (M10-15)
      M10: [
        "Write anonymous functions using lambda expressions",
        "Use lambda functions with sorted(), map(), and filter()",
        "Implement flexible functions with *args and **kwargs",
        "Create and apply function decorators",
        "Understand closures and function factories",
        "Apply functional programming patterns in Python",
      ],
      M11: [
        "Define classes and instantiate objects",
        "Implement the __init__ constructor method",
        "Create instance methods and attributes",
        "Understand encapsulation and name mangling",
        "Differentiate class variables from instance variables",
        "Build game character systems using OOP",
      ],
      M12: [
        "Create class hierarchies through inheritance",
        "Override parent methods in child classes",
        "Call parent constructors using super()",
        "Implement polymorphism across class hierarchies",
        "Design abstract base classes (ABCs)",
        "Build extensible shape hierarchy systems",
      ],
      M13: [
        "Create and manipulate datetime objects",
        "Format dates and times for display",
        "Parse string representations into datetime objects",
        "Perform date arithmetic with timedelta",
        "Handle timezone conversions appropriately",
        "Build event timer and validation applications",
      ],
      M14: [
        "Write regex patterns for text matching",
        "Use quantifiers, anchors, and character classes",
        "Extract data using capturing groups",
        "Perform search and match operations",
        "Implement find and replace with sub()",
        "Split strings using regex patterns",
        "Build log file analysis tools",
      ],
      M15: [
        "Create and manage virtual environments for project isolation",
        "Install and manage packages with pip and requirements.txt",
        "Debug Python code effectively using pdb breakpoints",
        "Structure multi-file projects using modules and packages",
        "Create installable Python packages with setup.py",
        "Build and distribute a complete CLI tool",
      ],

      // 🟢 PHASE 3: Advanced Applications (M16-20)
      M16: [
        "Make HTTP requests with the requests library",
        "Parse and handle JSON responses",
        "Understand HTTP status codes and error handling",
        "Send data with POST requests",
        "Build a complete API client application",
      ],
      M17: [
        "Create and manipulate NumPy arrays",
        "Perform vectorized mathematical operations",
        "Work with Pandas Series and DataFrames",
        "Filter and transform tabular data",
        "Build data analysis pipelines",
      ],
      M18: [
        "Understand HTML structure and the DOM",
        "Fetch web pages using requests",
        "Parse HTML with BeautifulSoup",
        "Extract data using CSS selectors and class/ID attributes",
        "Implement ethical web scraping practices",
        "Build data extraction and storage tools",
      ],
      M19: [
        "Connect to SQLite databases",
        "Execute CREATE and INSERT statements",
        "Retrieve data with SELECT queries",
        "Implement parameterized queries for security",
        "Perform full CRUD operations",
        "Build database-driven applications",
      ],
      M20: [
        "Design and structure a complete CLI application",
        "Parse command-line arguments with argparse",
        "Integrate APIs, data processing, and database storage",
        "Write clean, maintainable production code",
        "Create a portfolio-ready final project",
      ],
    };

    return (
      objectivesMap[moduleNum] || [
        "Master core concepts",
        "Apply knowledge through exercises",
        "Complete practical projects",
      ]
    );
  },
};

// Export both the config and helpers
module.exports = {
  MODULE_CONFIGS,
  MODULE_HELPERS,

  // Original functions for backward compatibility
  getModuleConfig: (num) => MODULE_CONFIGS[num] || null,
  getAllModuleNumbers: () => Object.keys(MODULE_CONFIGS),
  getAllModuleConfigs: () => MODULE_CONFIGS,
  hasModuleConfig: (moduleNum) => MODULE_CONFIGS.hasOwnProperty(moduleNum),
  getModuleLessonCount: (moduleNum) => {
    const config = MODULE_CONFIGS[moduleNum];
    return config ? config.lessons.length : 0;
  },
  getLessonConfig: (moduleNum, lessonNum) => {
    const config = MODULE_CONFIGS[moduleNum];
    if (!config) return null;

    const lessonIndex = lessonNum - 1;
    if (lessonIndex < 0 || lessonIndex >= config.lessons.length) {
      return null;
    }
    return config.lessons[lessonIndex];
  },
  validateModuleConfig: (moduleNum) => {
    const config = MODULE_CONFIGS[moduleNum];
    const issues = [];

    if (!config) {
      return { valid: false, issues: [`Module ${moduleNum} not found`] };
    }

    if (!config.folder) issues.push(`Missing folder`);
    if (!config.title) issues.push(`Missing title`);
    if (!config.lessons || config.lessons.length === 0) {
      issues.push(`No lessons defined`);
    }

    config.lessons?.forEach((lesson, index) => {
      const lessonNum = index + 1;
      if (!lesson.file) issues.push(`Lesson ${lessonNum}: Missing file`);
      if (!lesson.title) issues.push(`Lesson ${lessonNum}: Missing title`);
      if (!lesson.type) issues.push(`Lesson ${lessonNum}: Missing type`);
    });

    return {
      valid: issues.length === 0,
      issues: issues,
    };
  },
  getModuleSummary: () => {
    return Object.keys(MODULE_CONFIGS).map((moduleNum) => {
      const config = MODULE_CONFIGS[moduleNum];
      return {
        moduleNum,
        title: config.title,
        lessonCount: config.lessons.length,
        folder: config.folder,
      };
    });
  },
};
