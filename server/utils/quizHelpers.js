// quizHelpers.js
const {
  XP,
  calculateLessonQuizXP,
} = require("../../shared/constants/progress.cjs");
const LessonQuizProgress = require("../models/LessonQuizProgress");

/**
 * Check if a lesson has a quiz component.
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
 * Now uses LessonQuizProgress collection instead of user.lessonQuizProgress array.
 *
 * @param   {string} userId   - User ID
 * @param   {string} lessonId - Lesson ID
 * @param   {Object} lesson   - Lesson document
 * @returns {Promise<Object>} Quiz progress record
 */
const getOrCreateQuizProgress = async (userId, lessonId, lesson) => {
  let quizProgress = await LessonQuizProgress.findOne({
    userId,
    lessonId,
  });

  if (!quizProgress && hasQuiz(lesson)) {
    quizProgress = await LessonQuizProgress.create({
      userId,
      lessonId,
      questionAttempts: [],
      completed: false,
      lastAttempt: new Date(),
    });
  }

  return quizProgress;
};

/**
 * Check if all quiz questions in a lesson have been answered correctly.
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
 * Now persists to LessonQuizProgress collection.
 *
 * @param   {Object}  quizProgress  - Quiz progress record (mutated in memory, then saved)
 * @param   {number}  questionIndex - Index of the question
 * @param   {boolean} isCorrect     - Whether the answer was correct
 * @returns {Promise<boolean>} Whether the answer was correct
 */
const updateQuizProgress = async (quizProgress, questionIndex, isCorrect) => {
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

  // Persist to database
  await LessonQuizProgress.findByIdAndUpdate(quizProgress._id, {
    questionAttempts: quizProgress.questionAttempts,
    lastAttempt: quizProgress.lastAttempt,
    completed: isQuizCompleted(quizProgress, {
      quiz: quizProgress._quizReference,
    }), // See note below
  });

  return attempt.correct;
};

/**
 * Get the number of attempts for a specific quiz question.
 */
const getQuestionAttempts = (quizProgress, questionIndex) => {
  const attempt = quizProgress?.questionAttempts?.find(
    (qa) => qa.questionIndex === questionIndex,
  );
  return attempt?.attempts || 1;
};

/**
 * Calculate XP for a correct quiz answer based on attempt count.
 */
const calculateQuizAnswerXP = (attempts) => {
  return calculateLessonQuizXP(attempts);
};

/**
 * Build an array of results for all quiz questions.
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
