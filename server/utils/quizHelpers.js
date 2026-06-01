// quizHelpers.js
const {
  XP,
  calculateLessonQuizXP,
} = require("../../shared/constants/progress.cjs");

/**
 * Check if a lesson has a quiz component.
 * @param   {Object} lesson - Lesson document
 * @returns {boolean} True if quiz array exists and is non-empty
 */
const hasQuiz = (lesson) => {
  return !!(
    lesson.quiz &&
    Array.isArray(lesson.quiz) &&
    lesson.quiz.length > 0
  );
};

/**
 * Check if a lesson has an exercise component.
 * @param   {Object} lesson - Lesson document
 * @returns {boolean} True if exercise object exists
 */
const hasExercise = (lesson) => {
  return !!(
    lesson.exercise &&
    (lesson.exercise.starterCode ||
      (lesson.exercise.steps && lesson.exercise.steps.length > 0) ||
      (lesson.exercise.testCases && lesson.exercise.testCases.length > 0))
  );
};

/**
 * Get or create a quiz progress record for a user on a specific lesson.
 * Initialises with empty questionAttempts if no progress exists yet.
 * Mutates the user document in place.
 *
 * @param   {Object} user     - User document (mutated)
 * @param   {string} lessonId - Lesson ID
 * @param   {Object} lesson   - Lesson document
 * @returns {Object} Quiz progress record
 */
const getOrCreateQuizProgress = (user, lessonId, lesson) => {
  let quizProgress = user.lessonQuizProgress?.find(
    (qp) => qp.lessonId.toString() === lessonId,
  );

  if (!quizProgress && hasQuiz(lesson)) {
    quizProgress = {
      lessonId: lesson._id,
      questionAttempts: [],
      completed: false,
      lastAttempt: new Date(),
    };
    if (!user.lessonQuizProgress) {
      user.lessonQuizProgress = [];
    }
    user.lessonQuizProgress.push(quizProgress);
  }
  return quizProgress;
};

/**
 * Check if all quiz questions in a lesson have been answered correctly.
 * @param   {Object} quizProgress - User's quiz progress record
 * @param   {Object} lesson       - Lesson document
 * @returns {boolean} True if every question has a correct attempt
 */
const isQuizCompleted = (quizProgress, lesson) => {
  if (!quizProgress || !hasQuiz(lesson)) return false;
  const totalQuestions = lesson.quiz.length;
  const answeredCorrectly =
    quizProgress.questionAttempts?.filter((qa) => qa.correct).length || 0;
  return answeredCorrectly === totalQuestions;
};

/**
 * Record a quiz answer attempt for a specific question.
 * Increments attempt count. If correct, marks the question as correct.
 * Mutates the quizProgress object in place.
 *
 * @param   {Object}  quizProgress  - Quiz progress record (mutated)
 * @param   {number}  questionIndex - Index of the question in the lesson's quiz array
 * @param   {boolean} isCorrect     - Whether the answer was correct
 * @returns {boolean} Whether the answer was correct
 */
const updateQuizProgress = (quizProgress, questionIndex, isCorrect) => {
  if (!quizProgress) return false;

  let attempt = quizProgress.questionAttempts?.find(
    (qa) => qa.questionIndex === questionIndex,
  );

  if (!attempt) {
    attempt = { questionIndex, attempts: 1, correct: isCorrect };
    quizProgress.questionAttempts.push(attempt);
  } else {
    attempt.attempts = (attempt.attempts || 1) + 1;
    if (isCorrect && !attempt.correct) {
      attempt.correct = true;
    }
  }

  quizProgress.lastAttempt = new Date();
  return attempt.correct;
};

/**
 * Get the number of attempts for a specific quiz question.
 * Defaults to 1 if no attempt record exists (first attempt).
 *
 * @param   {Object} quizProgress  - Quiz progress record
 * @param   {number} questionIndex - Question index
 * @returns {number} Attempt count
 */
const getQuestionAttempts = (quizProgress, questionIndex) => {
  const attempt = quizProgress?.questionAttempts?.find(
    (qa) => qa.questionIndex === questionIndex,
  );
  return attempt?.attempts || 1;
};

/**
 * Calculate XP for a correct quiz answer based on attempt count.
 * Delegates to the shared `calculateLessonQuizXP` for the actual formula.
 *
 * @param   {number} attempts - Number of attempts for this question
 * @returns {number} XP to award
 */
const calculateQuizAnswerXP = (attempts) => {
  return calculateLessonQuizXP(attempts);
};

/**
 * Build an array of results for all quiz questions, including attempt counts
 * and correctness. Used by the XP calculation pipeline.
 *
 * @param   {Object} quizProgress - Quiz progress record
 * @param   {Object} lesson       - Lesson document
 * @returns {Array} Array of { questionIndex, attempts, correct } objects
 */
const getQuizResultsForXP = (quizProgress, lesson) => {
  if (!quizProgress || !hasQuiz(lesson)) return [];

  return lesson.quiz.map((q, idx) => {
    const attempt = quizProgress.questionAttempts?.find(
      (qa) => qa.questionIndex === idx,
    );
    return {
      questionIndex: idx,
      attempts: attempt?.attempts || 1,
      correct: attempt?.correct || false,
    };
  });
};

module.exports = {
  hasQuiz,
  hasExercise,
  getOrCreateQuizProgress,
  isQuizCompleted,
  updateQuizProgress,
  getQuestionAttempts,
  calculateQuizAnswerXP,
  getQuizResultsForXP,
};
