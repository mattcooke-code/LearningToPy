// quizHelpers.js

/**
 * Check if a lesson has a quiz
 */
const hasQuiz = (lesson) => {
  return lesson.quiz && Array.isArray(lesson.quiz) && lesson.quiz.length > 0;
};

/**
 * Check if a lesson has a coding exercise
 */
const hasExercise = (lesson) => {
  return !!lesson.exercise;
};

/**
 * Get or create quiz progress for a user and lesson
 */
const getOrCreateQuizProgress = (user, lessonId, lesson) => {
  // Find existing quiz progress
  let quizProgress = user.lessonQuizProgress?.find(
    (qp) => qp.lessonId.toString() === lessonId
  );

  // Create new progress if needed and lesson has quiz
  if (!quizProgress && hasQuiz(lesson)) {
    quizProgress = {
      lessonId: lesson._id,
      correctAnswers: [],
      completed: false,
      lastAttempt: new Date(),
    };

    // Initialize lessonQuizProgress array if it doesn't exist
    if (!user.lessonQuizProgress) {
      user.lessonQuizProgress = [];
    }

    user.lessonQuizProgress.push(quizProgress);
  }

  return quizProgress;
};

/**
 * Check if quiz is fully completed
 */
const isQuizCompleted = (quizProgress, lesson) => {
  if (!quizProgress || !hasQuiz(lesson)) return false;

  const totalQuestions = lesson.quiz.length;
  const answeredCorrectly = quizProgress.correctAnswers.length;

  return answeredCorrectly === totalQuestions;
};

/**
 * Update quiz progress with a correct answer
 */
const updateQuizProgress = (quizProgress, questionIndex, lesson) => {
  if (!quizProgress) return false;

  // Add question index if not already in correctAnswers
  if (!quizProgress.correctAnswers.includes(questionIndex)) {
    quizProgress.correctAnswers.push(questionIndex);
    quizProgress.lastAttempt = new Date();
  }

  // Check if quiz is now completed
  const totalQuestions = lesson.quiz.length;
  quizProgress.completed =
    quizProgress.correctAnswers.length === totalQuestions;

  return quizProgress.completed;
};

module.exports = {
  hasQuiz,
  hasExercise,
  getOrCreateQuizProgress,
  isQuizCompleted,
  updateQuizProgress,
};
