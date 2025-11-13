// server/utils/seedModules.js
const mongoose = require("mongoose");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const { getDatabaseUri } = require("../config/envConfig");

const seedSampleData = async () => {
  try {
    console.log("🌱 Starting data seeding...");

    // Clear existing data
    console.log("🗑️ Clearing existing data...");
    await Module.deleteMany({});
    await Lesson.deleteMany({});

    // Create modules
    console.log("📚 Creating modules...");
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

    const module2 = await Module.create({
      title: "Data Structures",
      description:
        "Explore Python's built-in data structures like lists, dictionaries, and tuples.",
      shortDescription:
        "Master Python data structures for efficient programming",
      order: 2,
      difficulty: "beginner",
      estimatedHours: 4,
      isPublished: true,
      prerequisites: [module1._id],
      learningObjectives: [
        "Understand and use lists, tuples, and dictionaries",
        "Perform operations on data structures",
        "Choose the right data structure for different scenarios",
      ],
      icon: "📊",
      xpReward: 150,
    });

    // Create lessons for module 1
    console.log("📝 Creating lessons...");
    await Lesson.create([
      {
        title: "Welcome to Python",
        content: `# Welcome to Python!\n\nPython is a powerful, easy-to-learn programming language. Let's start with the basics.`,
        shortDescription:
          "Get started with Python and write your first program",
        order: 1,
        moduleId: module1._id,
        xpReward: 25,
        duration: 10,
        contentType: "theory",
        codeExample: {
          language: "python",
          code: 'print("Hello, Python!")',
          explanation: "The print() function displays text on the screen",
        },
        isPublished: true,
      },
      // In your seedModules.js, update lesson 2 content:
      {
        title: "Variables and Data Types",
        content: `# Variables and Data Types

Variables are like labeled containers that store information in your program.

## Creating Variables
In Python, you create a variable by giving it a name and assigning a value:

\`\`\`python
# String - for text data
name = "Alice"
favorite_language = "Python"

# Integer - for whole numbers  
age = 25
score = 100

# Float - for decimal numbers
height = 5.9
temperature = 98.6

# Boolean - for True/False values
is_student = True
has_graduated = False
\`\`\`

## Variable Naming Rules
- Use descriptive names (e.g., \`user_age\` instead of \`ua\`)
- Start with a letter or underscore
- Can contain letters, numbers, and underscores
- Case sensitive (\`age\` and \`Age\` are different)
- Use snake_case (words separated by underscores)

## Practice
Try creating variables to store information about yourself!`,
        shortDescription:
          "Learn how to store and work with different types of data",
        order: 2,
        moduleId: module1._id,
        xpReward: 25,
        duration: 15,
        contentType: "theory",
        exercise: {
          instructions:
            "Create three variables: one for your name (string), one for your age (number), and one indicating if you're a student (boolean)",
          starterCode: "# Create your variables here\n",
          solution: 'name = "Your Name"\nage = 25\nis_student = True',
          hints: [
            "Use the assignment operator = to create variables",
            "Strings need quotes around them - 'text' or \"text\"",
            "Numbers don't need quotes - just write the number",
            "Booleans are either True or False (capital T and F)",
          ],
        },
        isPublished: true,
      },
      {
        title: "Basic Operations",
        content: `# Basic Operations\n\nPython can perform mathematical operations and work with text.`,
        shortDescription: "Perform calculations and work with strings",
        order: 3,
        moduleId: module1._id,
        xpReward: 25,
        duration: 20,
        contentType: "exercise",
        quiz: {
          question: "What is the result of 3 * 4 + 2 in Python?",
          options: ["14", "18", "20", "Syntax Error"],
          correctAnswer: 0,
          explanation:
            "Python follows standard order of operations: multiplication before addition",
        },
        isPublished: true,
      },
    ]);

    console.log("✅ Sample data seeded successfully!");
    console.log(
      `📊 Created ${await Module.countDocuments()} modules and ${await Lesson.countDocuments()} lessons`
    );
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
};

// Add this function to connect and run the seeder
const runSeeder = async () => {
  try {
    // Connect to MongoDB using the same URI as your server
    const MONGODB_URI = getDatabaseUri();

    console.log(`🔗 Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Run the seeder
    await seedSampleData();

    // Close connection
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
  } catch (error) {
    console.error("❌ Seeder failed:", error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  runSeeder();
}

module.exports = seedSampleData;
