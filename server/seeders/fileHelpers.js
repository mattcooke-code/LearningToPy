// server/seeders/fileHelpers.js
const fs = require("fs");
const path = require("path");

// Define the curriculum root path
const CURRICULUM_ROOT = path.join(__dirname, "..", "curriculum");

const readContent = (moduleFolder, fileName) => {
  try {
    const filePath = path.join(CURRICULUM_ROOT, moduleFolder, fileName);

    // Check if file exists before reading
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${moduleFolder}/${fileName}`);
      return null;
    }

    const content = fs.readFileSync(filePath, "utf8");

    // Validate content is not empty
    if (!content || content.trim().length === 0) {
      console.warn(`⚠️ Empty file: ${moduleFolder}/${fileName}`);
      return null;
    }

    return content;
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
    if (!content) {
      return null;
    }

    const parsed = JSON.parse(content);

    // Basic JSON validation
    if (typeof parsed !== "object" || parsed === null) {
      console.error(
        `❌ Invalid JSON structure in: ${moduleFolder}/${fileName}`
      );
      return null;
    }

    return parsed;
  } catch (error) {
    console.error(
      `❌ Could not parse JSON file: ${moduleFolder}/${fileName}`,
      error.message
    );
    return null;
  }
};

// Enhanced validation function
const validateFileContent = (content, moduleFolder, fileName) => {
  if (!content) {
    throw new Error(
      `Required file missing or empty: ${moduleFolder}/${fileName}`
    );
  }
  return content;
};

// New function to check if module folder exists
const validateModuleFolder = (moduleFolder) => {
  const folderPath = path.join(CURRICULUM_ROOT, moduleFolder);
  if (!fs.existsSync(folderPath)) {
    console.error(`❌ Module folder not found: ${moduleFolder}`);
    return false;
  }
  return true;
};

module.exports = {
  readContent,
  parseJSONContent,
  validateFileContent,
  validateModuleFolder,
};
