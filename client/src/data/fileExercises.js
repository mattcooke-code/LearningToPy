// /client/src/data/fileExercises.js
/**
 * @fileoverview Exercise-specific file creation code mapping.
 *
 * Single source of truth for exercise filesystem setup. Exposes:
 *   - buildFileSetupCode()   — explicit fileSetup object -> Python source
 *   - getFileCreationCode()  — Python source (explicit fileSetup, else legacy map)
 *   - getExpectedFiles()     — filenames the setup is expected to create
 *
 * getFileCreationCode() and getExpectedFiles() resolve through the SAME
 * lookup, so the generated setup code and the post-setup existence checks
 * can never disagree.
 *
 * @module data/fileExercises
 */

/**
 * Legacy procedural setups, matched by title substring or challengeGroup.
 * `files` MUST list every filename `code` creates — it drives the
 * FileNotFoundError checks in pythonCodeValidationService.buildTestScript().
 *
 * Prefer `exercise.fileSetup` for new content; this map exists for
 * exercises that predate it.
 *
 * @type {{ title?: string, challengeGroup?: string, files: string[], code: string }[]}
 */
const FILE_CREATION_MAP = [
  // Lesson 7.1 - Opening and Reading Files
  {
    title: "Opening and Reading Files",
    challengeGroup: "file-reading-basics",
    files: ["messages.txt"],
    code: `with open('messages.txt', 'w') as f: f.write('This is the first line.\\nThis is the second line.\\nAnd the final message.')`,
  },
  // Lesson 7.2 - Line-by-Line Reading
  {
    title: "Line-by-Line Reading",
    challengeGroup: "file-line-processing",
    files: ["shopping_list.txt"],
    code: `with open('shopping_list.txt', 'w') as f: f.write('Milk\\nEggs\\nBread\\nCheese')`,
  },
  // Lesson 7.3 - Using the With Statement
  {
    title: "Using the With Statement",
    challengeGroup: "context-manager",
    files: ["settings.conf"],
    code: `with open('settings.conf', 'w') as f: f.write('HOST=localhost\\nPORT=8080\\nDEBUG=True')`,
  },
  // Lesson 7.4 - Writing and Appending Data
  {
    title: "Writing and Appending Data",
    challengeGroup: "file-writing",
    files: ["data.txt"],
    code: `with open('data.txt', 'w') as f: f.write('')`,
  },
  // Lesson 7.5 - Log File Processing Project
  {
    title: "Log File Processing",
    challengeGroup: "file-io-project",
    files: ["server_log_raw.txt"],
    code: `with open('server_log_raw.txt', 'w') as f: f.write('404|/image/logo.png\\n200|/api/v1/profile/data\\n200|/products/listing\\n500|/admin/internal/error\\n200|/checkout/process\\n403|/secret/page\\n')`,
  },
  // Lesson 8.2. - Handling Specific Exceptions
  {
    title: "Handling Specific Exceptions",
    challengeGroup: "specific-exceptions",
    files: ["data.txt"],
    code: `with open('data.txt', 'w') as f: f.write('0')`,
  },
];

/**
 * Build Python source that writes an explicit `fileSetup` map to disk.
 *
 * JSON.stringify() is used deliberately for both the filename and the
 * body: every escape it emits (\\, \", \n, \t, \uXXXX) is also a valid
 * Python string escape, so CRLF, quotes and backslashes are all handled
 * correctly without hand-rolled regex chains.
 *
 * Safe to call from any component — returns "" for nullish/empty input.
 *
 * @param {Object<string, string>} fileSetup - filename -> file contents
 * @returns {string} Python source, or "" if there is nothing to create.
 */
export const buildFileSetupCode = (fileSetup) => {
  if (!fileSetup || typeof fileSetup !== "object" || Array.isArray(fileSetup)) {
    return "";
  }

  return Object.entries(fileSetup)
    .map(([name, content]) => {
      const text =
        typeof content === "string" ? content : String(content ?? "");
      return `with open(${JSON.stringify(name)}, 'w', encoding='utf-8') as f:\n    f.write(${JSON.stringify(text)})`;
    })
    .join("\n");
};

/**
 * Resolve the legacy map entry for an exercise, if any.
 * @private
 */
const findLegacySetup = (exercise) => {
  const title = typeof exercise.title === "string" ? exercise.title : "";
  const challengeGroup =
    typeof exercise.challengeGroup === "string" ? exercise.challengeGroup : "";

  return FILE_CREATION_MAP.find(
    (entry) =>
      (entry.title && title.includes(entry.title)) ||
      (entry.challengeGroup && challengeGroup === entry.challengeGroup),
  );
};

/** True if the exercise carries a usable explicit fileSetup map. @private */
const hasExplicitSetup = (exercise) => {
  const setup = exercise.fileSetup;
  return (
    !!setup &&
    typeof setup === "object" &&
    !Array.isArray(setup) &&
    Object.keys(setup).length > 0
  );
};

/**
 * Get the Python file-creation code for an exercise.
 * Explicit `fileSetup` wins; otherwise fall back to the legacy map.
 *
 * @param {object} [exercise] - Exercise definition (nullish-safe).
 * @returns {string} Python source, or "" if no setup is needed.
 */
export const getFileCreationCode = (exercise) => {
  const safeExercise = exercise ?? {};

  if (hasExplicitSetup(safeExercise)) {
    return buildFileSetupCode(safeExercise.fileSetup);
  }

  return findLegacySetup(safeExercise)?.code || "";
};

/**
 * Get the filenames an exercise's setup is expected to create.
 * Resolves through the same lookup as getFileCreationCode(), so the
 * existence checks always match the code that actually ran.
 *
 * @param {object} [exercise] - Exercise definition (nullish-safe).
 * @returns {string[]} Filenames, or [] if no setup is needed.
 */
export const getExpectedFiles = (exercise) => {
  const safeExercise = exercise ?? {};

  if (hasExplicitSetup(safeExercise)) {
    return Object.keys(safeExercise.fileSetup);
  }

  return [...(findLegacySetup(safeExercise)?.files || [])];
};
