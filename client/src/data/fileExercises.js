// /client/src/data/fileExercises.js
/**
 * @fileoverview Exercise-specific file creation code mapping.
 *
 * Maps exercises (by title or challenge group) to Python code snippets that
 * set up required files before the user's code is executed for validation.
 * Used by `validationUtils.js` to prepare the Pyodide filesystem.
 *
 * To add support for a new file-based exercise, add a new entry to the
 * `FILE_CREATION_MAP` array.
 *
 * @module data/fileExercises
 */

/**
 * An array of file-creation mappings.
 *
 * Each entry matches an exercise by `title` substring or `challengeGroup`
 * key, and provides the Python code to create required files.
 *
 * @type {{ title?: string, challengeGroup?: string, code: string }[]}
 */
const FILE_CREATION_MAP = [
  // Lesson 7.1 - Opening and Reading Files
  {
    title: "Opening and Reading Files",
    challengeGroup: "file-reading-basics",
    code: `
with open('messages.txt', 'w') as f:
    f.write('This is the first line.\\nThis is the second line.\\nAnd the final message.')
`,
  },

  // Lesson 7.2 - Line-by-Line Reading
  {
    title: "Line-by-Line Reading",
    challengeGroup: "file-line-processing",
    code: `
with open('shopping_list.txt', 'w') as f:
    f.write('Milk\\nEggs\\nBread\\nCheese')
`,
  },

  // Lesson 7.3 - Using the With Statement
  {
    title: "Using the With Statement",
    challengeGroup: "context-manager",
    code: `
with open('settings.conf', 'w') as f:
    f.write('HOST=localhost\\nPORT=8080\\nDEBUG=True')
`,
  },

  // Lesson 7.4 - Writing and Appending Data
  {
    title: "Writing and Appending Data",
    challengeGroup: "file-writing",
    code: `
with open('data.txt', 'w') as f:
    f.write('')
`,
  },

  // Lesson 7.5 - Log File Processing Project
  {
    title: "Log File Processing",
    challengeGroup: "file-io-project",
    code: `
with open('server_log_raw.txt', 'w') as f:
    f.write('404|/image/logo.png\\n200|/api/v1/profile/data\\n200|/products/listing\\n500|/admin/internal/error\\n200|/checkout/process\\n403|/secret/page\\n')
`,
  },
];

/**
 * Get the Python file-creation code for an exercise, if any.
 *
 * Matches the exercise against the `FILE_CREATION_MAP` by title substring
 * or challenge group. Returns the first match, or an empty string if no
 * match is found.
 *
 * @param {object} exercise - The exercise definition object.
 * @param {string} [exercise.title=""] - The exercise title.
 * @param {string} [exercise.challengeGroup=""] - The challenge group key.
 * @returns {string} Python code that creates the required files, or an empty
 *   string if this exercise doesn't need file setup.
 */
export const getFileCreationCode = (exercise) => {
  const title = exercise.title || "";
  const challengeGroup = exercise.challengeGroup || "";

  const match = FILE_CREATION_MAP.find(
    (entry) =>
      (entry.title && title.includes(entry.title)) ||
      (entry.challengeGroup && challengeGroup === entry.challengeGroup),
  );

  return match?.code || "";
};
