// server/utils/seederHelpers.js

/**
 * Extracts the questions array from a quiz JSON object
 * and ensures it's in the format Mongoose expects.
 */

// server/utils/seederHelpers.js

const prepareQuizData = (quizData, isModuleQuiz = false) => {
  if (!quizData) return isModuleQuiz ? { questions: [] } : [];

  // 1. Extract the raw questions array regardless of input format
  const questionsArray = Array.isArray(quizData)
    ? quizData
    : quizData.questions || (quizData.question ? [quizData] : []);

  // 2. Format the questions to ensure they have all required fields
  const formattedQuestions = questionsArray.map((q, idx) => ({
    id: q.id || `q_${idx}`,
    question: q.question,
    options: q.options || [],
    correctAnswer: q.correctAnswer,
    explanation: q.explanation || "",
    type: q.type || "multiple-choice",
  }));

  // 3. Return the specific structure required
  if (isModuleQuiz) {
    return {
      title: quizData.title || "Module Review Quiz",
      description: quizData.description || "",
      settings: {
        randomizeQuestionOrder: true,
        randomizeAnswerOrder: true,
        passingScore: quizData.passingScore || 70,
      },
      questions: formattedQuestions,
    };
  }

  // Otherwise, return just the array for Lesson models
  return formattedQuestions;
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
