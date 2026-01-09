// server/utils/seederHelpers.js

/**
 * Extracts the questions array from a quiz JSON object
 * and ensures it's in the format Mongoose expects.
 */
const prepareQuizData = (quizData) => {
  if (!quizData) return [];

  // If it's already an array, return it
  if (Array.isArray(quizData)) return quizData;

  // If it's an object with a 'questions' property, return that array
  if (quizData.questions && Array.isArray(quizData.questions)) {
    return quizData.questions;
  }

  // Fallback: wrap in array if it's a single question object, else empty
  return quizData.question ? [quizData] : [];
};

/**
 * A higher-level helper to load lesson-related JSON assets
 * Handles the "check if exists -> parse -> format" flow
 */
const loadLessonAsset = (parseFn, folder, fileName, type = "exercise") => {
  if (!fileName) return type === "quiz" ? [] : null;

  const data = parseFn(folder, fileName);

  if (type === "quiz") {
    return prepareQuizData(data);
  }

  return data; // Exercises usually don't need unwrapping like quizzes do
};

module.exports = { prepareQuizData, loadLessonAsset };
