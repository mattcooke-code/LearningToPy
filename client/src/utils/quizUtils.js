//quizUtils.js

/**
 * Check if all questions in a quiz have been answered correctly
 */
export const areAllQuestionsCorrect = (quizArray, results) => {
  return quizArray.every((q) => {
    const qKey = q._id || q.id;
    return results[qKey]?.isCorrect === true;
  });
};

/**
 * Check if all questions have been answered (regardless of correctness)
 */
export const areAllQuestionsAnswered = (quizArray, answers) => {
  return quizArray.every((q) => {
    const qKey = q._id || q.id;
    return answers[qKey] !== undefined;
  });
};

/**
 * Get the number of correct answers
 */
export const getCorrectAnswerCount = (quizArray, results) => {
  return quizArray.filter((q) => {
    const qKey = q._id || q.id;
    return results[qKey]?.isCorrect === true;
  }).length;
};

/**
 * Get the number of answered questions
 */
export const getAnsweredQuestionCount = (answers) => {
  return Object.keys(answers).length;
};

/**
 * Reset a single question's state
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
 * Process module quiz results from server response
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
 * Determine button styling for quiz options
 */
export const getOptionButtonClass = (isSelected, showResults, isCorrect) => {
  // If results are shown
  if (showResults) {
    if (isCorrect) {
      // Correct answer styling
      return "border-green-500 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
    } else if (isSelected) {
      // Wrong selected answer styling
      return "border-red-500 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
    } else {
      // Wrong unselected answer styling
      return "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700";
    }
  }

  // Before submission - normal state
  if (isSelected) {
    return "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
  }

  // Default unselected state
  return "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700";
};

/**
 * Check if lesson quiz is complete (all questions correct)
 */
export const isLessonQuizComplete = (quizArray, results) => {
  if (!quizArray || quizArray.length === 0) return false;
  return areAllQuestionsCorrect(quizArray, results);
};
