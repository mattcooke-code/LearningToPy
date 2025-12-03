export const THRESHOLDS = Object.freeze({
  BEGINNER: 25,
  INTERMEDIATE: 50,
  ADVANCED: 75,
  MASTER: 90,
  COMPLETE: 100,

  /*QUIZ_PERFORMANCE: Object.freeze({
    PERFECT_SCORE: 100,
    EXCELLENT: 90,
    GOOD: 75,
    PASSING: 60,
  }),*/
});

export const XP = Object.freeze({
  PER_LEVEL: 100,
  MODULE_BONUS: 50,
  LESSON_REWARD: 25,
  QUIZ: Object.freeze({
    CORRECT_ON: Object.freeze({
      FIRST_ATTEMPT: 15,
      SECOND_ATTEMPT: 10,
      THIRD_ATTEMPT: 5,
      FOURTH_PLUS_ATTEMPT: 0,
    }),

    MODULE_QUIZ_BONUS: 25,
    PHASE_QUIZ_BONUS: 100,
  }),
});

// Optional: default export
export default {
  THRESHOLDS,
  XP,
};
