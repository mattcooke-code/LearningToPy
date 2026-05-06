// /client/src/utils/lessonFormUtils.js
/**
 * @fileoverview Lesson form data transformation utilities.
 *
 * Provides default form state, API-to-form mapping (including test case
 * formatting and populated-ID unwrapping), and form-to-API normalisation
 * (JSON parsing, content-type-based field pruning, type casting).
 *
 * Used primarily by `LessonEditorModal.jsx` for the admin lesson editor.
 *
 * @module utils/lessonFormUtils
 */

/**
 * Default form state for lesson creation/editing.
 *
 * All fields are initialised to safe defaults so the form is immediately
 * usable without additional initialisation logic.
 *
 * @type {object}
 */
export const DEFAULT_LESSON_FORM_DATA = {
  title: "",
  description: "",
  content: "",
  difficulty: "BEGINNER",
  xpReward: 100,
  estimatedTime: 15,
  order: 0,
  isPublished: false,
  tags: [],
  moduleId: "",
  prerequisiteLessonIds: [],
  challengeGroup: "",
  contentType: "THEORY",
  initialCode: "",
  testCases: "", // String in the UI — parsed to array on submit
  solution: "",
  hints: [],
  questions: [],
};

/**
 * Map an API lesson object to form-compatible data.
 *
 * Handles:
 * - Converting `testCases` from an array (API format) to a pretty-printed
 *   JSON string (form field format).
 * - Unwrapping populated `prerequisiteLessonIds` (Mongoose objects → ID strings).
 * - Ensuring `tags`, `hints`, and `questions` are always arrays.
 * - Casting `isPublished` to boolean.
 *
 * @param {object} [lesson={}] - The lesson object from the API (may be sparse).
 * @returns {object} A complete form data object with all defaults filled.
 */
export const mapLessonToFormData = (lesson = {}) => {
  let displayTestCases = "";
  if (lesson.testCases) {
    displayTestCases =
      typeof lesson.testCases === "string"
        ? lesson.testCases
        : JSON.stringify(lesson.testCases, null, 2);
  }

  return {
    ...DEFAULT_LESSON_FORM_DATA,
    ...lesson,
    isPublished: Boolean(lesson.isPublished),
    tags: Array.isArray(lesson.tags) ? [...lesson.tags] : [],
    prerequisiteLessonIds: Array.isArray(lesson.prerequisiteLessonIds)
      ? lesson.prerequisiteLessonIds.map((id) => id._id || id)
      : [],
    testCases: displayTestCases,
    hints: Array.isArray(lesson.hints) ? [...lesson.hints] : [],
    questions: Array.isArray(lesson.questions) ? [...lesson.questions] : [],
  };
};

/**
 * Normalise form data for API submission.
 *
 * Performs three transformations:
 * 1. **Test case parsing** — If `contentType` is `"EXERCISE"` and `testCases`
 *    is a non-empty string, parses it as JSON into an object/array.
 * 2. **Field pruning** — Removes exercise-specific fields (`initialCode`,
 *    `testCases`, `solution`, `hints`) for non-EXERCISE content types, and
 *    removes `questions` for non-QUIZ types.
 * 3. **Type casting** — Ensures `xpReward`, `estimatedTime`, and `order` are
 *    numbers.
 *
 * @param {object} formData - The raw form data from the editor.
 * @returns {object} A cleaned payload suitable for PUT/POST to the API.
 */
export const normalizeLessonForAPI = (formData) => {
  const payload = { ...formData };

  // 1. Convert testCases back to JSON object/array if it's a valid string
  if (
    payload.contentType === "EXERCISE" &&
    typeof payload.testCases === "string"
  ) {
    try {
      payload.testCases = payload.testCases.trim()
        ? JSON.parse(payload.testCases)
        : [];
    } catch (e) {
      console.error("Failed to parse test cases JSON", e);
    }
  }

  // 2. Remove unused fields based on content type
  if (payload.contentType !== "EXERCISE") {
    const exerciseFields = ["initialCode", "testCases", "solution", "hints"];
    exerciseFields.forEach((field) => delete payload[field]);
  }

  if (payload.contentType !== "QUIZ") {
    delete payload.questions;
  }

  // 3. Final type casting
  payload.xpReward = Number(payload.xpReward);
  payload.estimatedTime = Number(payload.estimatedTime);
  payload.order = Number(payload.order);

  return payload;
};
