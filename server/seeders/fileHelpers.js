// server/utils/seeders/fileHelpers.js
const fs = require("fs");
const path = require("path");

// Define the curriculum root path
const CURRICULUM_ROOT = path.join(__dirname, "..", "curriculum");

const readContent = (moduleFolder, fileName) => {
  try {
    const filePath = path.join(CURRICULUM_ROOT, moduleFolder, fileName);
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    console.error(
      `❌ Could not read content file: ${moduleFolder}/${fileName}`,
      error.message
    );
    return null;
  }
};

const parseJSONContent = (moduleFolder, fileName) => {
  try {
    const content = readContent(moduleFolder, fileName);
    return content ? JSON.parse(content) : null;
  } catch (error) {
    console.error(
      `❌ Could not parse JSON file: ${moduleFolder}/${fileName}`,
      error.message
    );
    return null;
  }
};

module.exports = { readContent, parseJSONContent };
