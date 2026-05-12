/**
 * Script to update module descriptions with fresh, accurate content
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { getDatabaseUri } = require("../config/envConfig");
const Module = require("../models/Module");

const MODULE_UPDATES = [
  {
    order: 0,
    title: "Getting Started",
    description:
      "Welcome to LearningToPy! This tutorial module introduces you to the platform, the terminal, and how to navigate your Python learning journey.",
    shortDescription: "Platform tutorial and getting started guide",
  },
  {
    order: 1,
    title: "1. Python Essentials",
    description:
      "Master the foundational syntax that makes Python the world's most popular programming language. Learn about variables, constants, dynamic typing, and basic input/output operations that form the building blocks of every Python program.",
    shortDescription: "Variables, dynamic typing, and I/O basics",
  },
  {
    order: 2,
    title: "2. Data Structures I: Lists & Tuples",
    description:
      "Organize your data efficiently with Python's sequence types. Master list operations, indexing, slicing, and understand tuple immutability for writing robust, memory-efficient code.",
    shortDescription: "List operations, indexing, slicing, and tuples",
  },
  {
    order: 3,
    title: "3. Control Flow & Decision Making",
    description:
      "Teach your programs how to think and make decisions. Master if-else logic, comparison operators, and conditional statements that control program execution flow.",
    shortDescription: "If-else logic, conditions, and decision making",
  },
  {
    order: 4,
    title: "4. Iteration & Loops",
    description:
      "Automate repetitive tasks with powerful loop structures. Learn while loops, for loops, range functions, nested loops, and loop optimization techniques for efficient iteration.",
    shortDescription: "While & for loops, range, and nested iteration",
  },
  {
    order: 5,
    title: "5. Data Structures II: Dictionaries & Sets",
    description:
      "Master Dictionaries for key-value mapping and Sets for unique collections. Learn efficient data management with hash-based lookups and set operations.",
    shortDescription: "Dictionaries, sets, and key-value mapping",
  },
  {
    order: 6,
    title: "6. Functions & Modular Code",
    description:
      "Write reusable, clean, and professional code with functions. Understand scope, lifetime, lambda expressions, and how to import and organize libraries.",
    shortDescription: "Functions, scope, lambdas, and library imports",
  },
  {
    order: 7,
    title: "7. File I/O & Data Persistence",
    description:
      "Read from and write to files like a pro. Master context managers, file handling, and CSV processing for real-world data manipulation.",
    shortDescription: "File reading/writing, context managers, CSV",
  },
  {
    order: 8,
    title: "8. Error Handling & Debugging",
    description:
      "Build robust applications that handle errors gracefully. Learn try/except blocks, custom exceptions, and professional debugging techniques.",
    shortDescription: "Try/except, custom exceptions, and debugging",
  },
  {
    order: 9,
    title: "9. Comprehensions & Elegant Code",
    description:
      "Write elegant Pythonic one-liners with list and dict comprehensions. Master conditional logic within comprehensions for concise, readable code.",
    shortDescription: "List/dict comprehensions and Pythonic patterns",
  },
  {
    order: 10,
    title: "10. Advanced Functions",
    description:
      "Master decorators, *args, **kwargs, closures, and functional programming patterns. Write professional-grade reusable code.",
    shortDescription: "Decorators, closures, *args, **kwargs",
  },
  {
    order: 11,
    title: "11. Object-Oriented Programming I",
    description:
      "Model real-world objects using classes and objects. Learn instance methods, encapsulation, and the fundamentals of OOP design.",
    shortDescription: "Classes, objects, methods, and encapsulation",
  },
  {
    order: 12,
    title: "12. Object-Oriented Programming II",
    description:
      "Advanced OOP with inheritance, polymorphism, and abstract base classes. Build extensible, maintainable class hierarchies.",
    shortDescription: "Inheritance, polymorphism, and ABCs",
  },
  {
    order: 13,
    title: "13. Working with Dates & Time",
    description:
      "Handle datetime operations like a pro. Master the datetime module, timezone handling, and date arithmetic for scheduling and logging.",
    shortDescription: "datetime module, timezones, and date math",
  },
  {
    order: 14,
    title: "14. Regular Expressions",
    description:
      "Master pattern matching and text processing with regex. Learn capturing groups, character classes, and powerful string manipulation.",
    shortDescription: "Pattern matching, regex functions, and text processing",
  },
  {
    order: 15,
    title: "15. Professional Python Tools",
    description:
      "Learn industry-standard tools for Python development. Master virtual environments, package management with pip, and debugging techniques.",
    shortDescription: "Virtual envs, pip, and professional tooling",
  },
  {
    order: 16,
    title: "16. HTTP & APIs",
    description:
      "Connect your Python apps to the web. Master the requests library, JSON handling, and REST API integration for modern applications.",
    shortDescription: "Requests, JSON, and API integration",
  },
  {
    order: 17,
    title: "17. Data Science Fundamentals",
    description:
      "Introduction to NumPy arrays and Pandas DataFrames. Learn the foundations of data analysis and scientific computing.",
    shortDescription: "NumPy and Pandas basics",
  },
  {
    order: 18,
    title: "18. Web Scraping",
    description:
      "Extract data from websites using BeautifulSoup and requests. Master HTML parsing, CSS selectors, and ethical data extraction.",
    shortDescription: "BeautifulSoup, HTML parsing, and data extraction",
  },
  {
    order: 19,
    title: "19. Database Integration",
    description:
      "Work with SQLite and relational databases. Learn SQL queries, CRUD operations, and connection management for data persistence.",
    shortDescription: "SQLite, SQL queries, and CRUD operations",
  },
  {
    order: 20,
    title: "20. Capstone Project",
    description:
      "Build your own Python project from scratch! Apply everything you've learned to create a portfolio-ready piece that showcases your Python mastery.",
    shortDescription: "Build a portfolio project from scratch",
  },
];

async function updateModuleDescriptions() {
  try {
    console.log("Connecting to database...");
    const MONGO_URI = getDatabaseUri();
    await mongoose.connect(MONGO_URI);
    console.log("Connected!");

    for (const update of MODULE_UPDATES) {
      const module = await Module.findOne({ order: update.order });
      if (!module) {
        console.log(`Module ${update.order} not found, skipping...`);
        continue;
      }

      const oldTitle = module.title;
      const oldDesc = module.description;

      // Use findOneAndUpdate to only update specific fields without triggering full validation
      await Module.findOneAndUpdate(
        { _id: module._id },
        {
          $set: {
            title: update.title,
            description: update.description,
            shortDescription: update.shortDescription,
          },
        },
        { runValidators: false }, // Skip validation to avoid enum case issues
      );

      console.log(`\nModule ${update.order} updated:`);
      console.log(`  Title: ${oldTitle} → ${update.title}`);
      console.log(
        `  Description: ${oldDesc.substring(0, 50)}... → ${update.description.substring(
          0,
          50,
        )}...`,
      );
    }

    console.log("\n=== Update Complete ===");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

updateModuleDescriptions();
