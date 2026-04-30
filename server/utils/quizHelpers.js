// quizHelpers.js
const {
  XP,
  calculateLessonQuizXP,
} = require("../../shared/constants/progress.cjs");

const hasQuiz = (lesson) => {
  return lesson.quiz && Array.isArray(lesson.quiz) && lesson.quiz.length > 0;
};

const hasExercise = (lesson) => {
  return !!lesson.exercise;
};

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

const isQuizCompleted = (quizProgress, lesson) => {
  if (!quizProgress || !hasQuiz(lesson)) return false;
  const totalQuestions = lesson.quiz.length;
  const answeredCorrectly =
    quizProgress.questionAttempts?.filter((qa) => qa.correct).length || 0;
  return answeredCorrectly === totalQuestions;
};

const updateQuizProgress = (quizProgress, questionIndex, isCorrect) => {
  if (!quizProgress) return false;

  // Find or create attempt record for this question
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

// Get attempt count for a specific question
const getQuestionAttempts = (quizProgress, questionIndex) => {
  const attempt = quizProgress?.questionAttempts?.find(
    (qa) => qa.questionIndex === questionIndex,
  );
  return attempt?.attempts || 1;
};

/**
 *  Calculate XP for a single correct quiz answer based on attempt count
 * @param {number} attempts - Number of attempts for this question
 * @returns {number} - XP to award
 */

const calculateQuizAnswerXP = (attempts) => {
  return calculateLessonQuizXP(attempts);
};

//  Get all correct answers with attempt counts (for XP calculation)
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
