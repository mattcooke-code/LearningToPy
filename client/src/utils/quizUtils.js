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
  if (showResults) {
    if (isSelected) {
      return isCorrect
        ? "bg-green-100 border-green-500"
        : "bg-red-100 border-red-500";
    }
    return "opacity-50";
  }

  if (isSelected) {
    return "border-blue-500 bg-blue-50 ring-2 ring-blue-200";
  }

  return "border-gray-200";
};

/**
 * Check if lesson quiz is complete (all questions correct)
 */
export const isLessonQuizComplete = (quizArray, results) => {
  if (!quizArray || quizArray.length === 0) return false;
  return areAllQuestionsCorrect(quizArray, results);
};
