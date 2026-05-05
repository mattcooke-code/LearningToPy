// server/utils/seederHelpers.js

/**
 * Normalize quiz data into the format expected by Mongoose models.
 *
 * Handles multiple input formats: an array of questions, an object with a
 * `questions` key, or a single question object. Ensures every question has
 * id, question, options, correctAnswer, explanation, and type fields.
 *
 * @param   {Object|Array} quizData      - Raw quiz data from seed files
 * @param   {boolean}      [isModuleQuiz=false] - If true, wraps in { title, description, settings, questions }
 * @returns {Array|Object} Formatted quiz data (array for lessons, object for modules)
 */
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
 * Load a lesson-related JSON asset and format it appropriately.
 *
 * For quizzes, delegates to `prepareQuizData` for normalisation.
 * For exercises, returns the parsed data as-is.
 *
 * @param   {Function} parseFn  - Function to parse the file (e.g., JSON.parse from fileHelpers)
 * @param   {string}   folder   - Folder containing the asset
 * @param   {string}   fileName - Asset filename
 * @param   {string}   [type="exercise"] - "quiz" or "exercise"
 * @returns {Object|Array|null} Parsed and formatted data
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
