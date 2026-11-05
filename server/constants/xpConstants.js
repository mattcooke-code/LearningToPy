// xpConstants.js

const THRESHOLDS = Object.freeze({
  // Completion thresholds
  LESSON_PASS: 100,
  MODULE_PASS: 100,

  // Quiz scoring
  QUIZ: Object.freeze({
    PASSING_SCORE: 70, // Standardized across lesson + module quizzes
    PERFECT: 100,
  }),
});

const XP = Object.freeze({
  // Core progression
  PER_LEVEL: 100,

  // Lesson-level rewards
  LESSON: Object.freeze({
    COMPLETION: 20, // Base XP for finishing a lesson
    PROJECT_BONUS: 15, // Extra for project lessons (last lesson before module quiz)
  }),

  // Coding exercise rewards (effort-based)
  EXERCISE: Object.freeze({
    SUBMISSION_BASE: 5, // XP per submission attempt
    FIRST_TRY_BONUS: 10, // Bonus if tests pass on first submission
    MAX_SUBMISSION_XP: 25, // Cap to prevent farming
  }),

  // Lesson quiz rewards (staggered by attempts)
  LESSON_QUIZ: Object.freeze({
    CORRECT: Object.freeze({
      FIRST_ATTEMPT: 15,
      SECOND_ATTEMPT: 10,
      THIRD_ATTEMPT: 5,
      FOURTH_PLUS: 0,
    }),
    PASSING_BONUS: 5, // Awarded if quiz score >= PASSING_SCORE
  }),

  // Module quiz rewards (exam-style: flat per correct answer)
  MODULE_QUIZ: Object.freeze({
    CORRECT_ANSWER: 10,
    COMPLETION_BONUS: 30,
    PERFECT_SCORE_BONUS: 20,
  }),

  // Module completion rewards
  MODULE: Object.freeze({
    COMPLETION_BONUS: 50,
    PHASE_1_BONUS: 25,
    PHASE_2_BONUS: 35,
    PHASE_3_BONUS: 50,
  }),

  // Special module handling
  SPECIAL: Object.freeze({
    M0_COMPLETION: 10, // Small XP for finishing tutorial
    M0_NO_QUIZ_EXERCISE_XP: true, // Don't award XP for M0 quiz/exercise
    M20_PROJECT_BONUS: 40, // Capstone project = bigger reward
  }),
});

module.exports = {
  THRESHOLDS,
  XP,
};
