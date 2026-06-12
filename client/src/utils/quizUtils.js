// /client/src/utils/quizUtils.js
/**
 * @fileoverview Quiz state management and utility functions.
 *
 * Pure functions for evaluating quiz answer correctness, counting results,
 * resetting question state, processing server responses, and determining
 * option button styling. Used by `QuizComponent` and `ModuleQuizPage` to
 * manage quiz interaction state without mutating component state directly.
 *
 * @module utils/quizUtils
 */

/**
 * Check if all questions in a quiz have been answered correctly.
 *
 * @param {object[]} quizArray - Array of question objects, each with `_id`
 *   or `id`.
 * @param {object} results - Map of question key → `{ isCorrect: boolean }`.
 * @returns {boolean} True if every question has a correct result.
 */
export const areAllQuestionsCorrect = (quizArray, results) => {
  return quizArray.every((q) => {
    const qKey = q._id || q.id;
    return results[qKey]?.isCorrect === true;
  });
};

/**
 * Check if all questions have been answered (regardless of correctness).
 *
 * @param {object[]} quizArray - Array of question objects.
 * @param {object} answers - Map of question key → selected answer value.
 * @returns {boolean} True if every question has a non-undefined answer.
 */
export const areAllQuestionsAnswered = (quizArray, answers) => {
  return quizArray.every((q) => {
    const qKey = q._id || q.id;
    return answers[qKey] !== undefined;
  });
};

/**
 * Count the number of correctly answered questions.
 *
 * @param {object[]} quizArray - Array of question objects.
 * @param {object} results - Map of question key → `{ isCorrect: boolean }`.
 * @returns {number} The count of questions with `isCorrect === true`.
 */
export const getCorrectAnswerCount = (quizArray, results) => {
  return quizArray.filter((q) => {
    const qKey = q._id || q.id;
    return results[qKey]?.isCorrect === true;
  }).length;
};

/**
 * Count the number of questions that have been answered.
 *
 * @param {object} answers - Map of question key → selected answer value.
 * @returns {number} The number of keys in the answers object.
 */
export const getAnsweredQuestionCount = (answers) => {
  return Object.keys(answers).length;
};

/**
 * Reset a single question's answer and result state.
 *
 * Removes the question's entry from both the answers and results state
 * objects via the provided setter functions. Designed to be called from
 * within a React component's state update.
 *
 * @param {string} questionId - The ID of the question to reset.
 * @param {Function} setAnswers - React state setter for the answers map.
 * @param {Function} setResults - React state setter for the results map.
 */
export const resetQuestionState = (questionId, setAnswers, setResults) => {
  setAnswers((prev) => {
    const newAnswers = { ...prev };
    delete newAnswers[questionId];
    return newAnswers;
  });

  setResults((prev) => {
    const newResults = { ...prev };
    delete newResults[questionId];
    return newResults;
  });
};

/**
 * Transform raw server quiz results into the client-side results map format.
 *
 * The server returns an array of `{ questionId, isCorrect }` objects. This
 * converts it to `{ [questionId]: { show: true, isCorrect } }` for the
 * component state.
 *
 * @param {{ questionId: string, isCorrect: boolean }[]} serverResults - Raw
 *   results array from the API.
 * @returns {object} A results map keyed by question ID.
 */
export const processModuleQuizResults = (serverResults) => {
  const processedResults = {};

  serverResults.forEach((res) => {
    processedResults[res.questionId] = {
      show: true,
      isCorrect: res.isCorrect,
    };
  });

  return processedResults;
};

/**
 * Determine the CSS class string for a quiz option button based on its state.
 *
 * States handled:
 * - **Results shown + correct:** Green highlight.
 * - **Results shown + selected + wrong:** Red highlight.
 * - **Results shown + unselected:** Neutral, muted.
 * - **Pre-submission + selected:** Blue highlight.
 * - **Pre-submission + unselected:** Default neutral.
 *
 * @param {boolean} isSelected - Whether this option is the user's current
 *   selection.
 * @param {boolean} showResults - Whether results are currently being displayed.
 * @param {boolean} isCorrect - Whether this option is the correct answer.
 * @returns {string} A Tailwind CSS class string.
 */
export const getOptionButtonClass = (isSelected, showResults, isCorrect) => {
  if (showResults) {
    if (isCorrect) {
      return "border-green-500 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
    } else if (isSelected) {
      return "border-red-500 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
    } else {
      return "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700";
    }
  }

  if (isSelected) {
    return "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
  }

  return "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700";
};

/**
 * Determine whether a lesson quiz is fully complete (all questions correct).
 *
 * Returns `false` if `quizArray` is empty or falsy.
 *
 * @param {object[]} quizArray - Array of question objects.
 * @param {object} results - Map of question key → `{ isCorrect: boolean }`.
 * @returns {boolean} True if all questions are answered correctly.
 */
export const isLessonQuizComplete = (quizArray, results) => {
  if (!quizArray || quizArray.length === 0) return false;
  return areAllQuestionsCorrect(quizArray, results);
};

/**
 * Fisher-Yates shuffle — returns a new shuffled array without mutating the original.
 * O(n) time, O(n) space.
 *
 * @param {any[]} array - The array to shuffle.
 * @returns {any[]} A new array with elements in random order.
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Build a map of shuffled answer options for each question.
 *
 * For each question, shuffles the option indices and tracks the mapping
 * between display indices and original indices, along with the correct
 * answer index.
 *
 * @param {object[]} questions - Array of question objects with `_id`,
 *   `options`, and `correctAnswer`.
 * @returns {object} Map of questionId → { shuffledIndices, originalOptions, correctAnswer }
 */
export const buildShuffledOptions = (questions) => {
  const optionsMap = {};
  questions.forEach((question) => {
    if (question.options && Array.isArray(question.options)) {
      const indices = question.options.map((_, i) => i);
      const shuffledIndices = shuffleArray(indices);
      optionsMap[question._id] = {
        shuffledIndices,
        originalOptions: question.options,
        correctAnswer: question.correctAnswer,
      };
    }
  });
  return optionsMap;
};

/**
 * Get the display-order options for a question from the shuffled options map.
 *
 * @param {object} optionsMap - The map from buildShuffledOptions.
 * @param {string} questionId - The question's ID.
 * @param {string[]} originalOptions - The original (unshuffled) options array.
 * @returns {string[]} Options in shuffled display order.
 */
export const getShuffledOptions = (optionsMap, questionId, originalOptions) => {
  const mapping = optionsMap[questionId];
  if (mapping?.shuffledIndices) {
    return mapping.shuffledIndices.map((idx) => originalOptions[idx]);
  }
  return originalOptions;
};

/**
 * Convert a display index to the original option index using the shuffled
 * options map.
 *
 * @param {object} optionsMap - The map from buildShuffledOptions.
 * @param {string} questionId - The question's ID.
 * @param {number} displayIndex - The index as shown to the user.
 * @returns {number} The original option index.
 */
export const getActualIndex = (optionsMap, questionId, displayIndex) => {
  const mapping = optionsMap[questionId];
  if (mapping?.shuffledIndices) {
    return mapping.shuffledIndices[displayIndex];
  }
  return displayIndex;
};
