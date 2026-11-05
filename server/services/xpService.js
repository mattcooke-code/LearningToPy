// server/services/xpService.js
const { XP } = require("../constants/xpConstants");
const { MODULE_REWARDS } = require("../constants/moduleRewards");

/**
 * Retrieves the base XP reward for completing a specific module.
 * @param {number} order - The module order/number (e.g., 1, 2, ..., 20).
 * @returns {number} The XP reward amount.
 */
const getModuleRewardXp = (order) => {
  return MODULE_REWARDS[order]?.xpReward ?? 100;
};

/**
 * Determines the curriculum phase based on the module order.
 * @param {number} order - The module order/number.
 * @returns {number} The phase number (1, 2, or 3), or 0 if not found.
 */
const getModulePhase = (order) => {
  if (order >= 1 && order <= 9) return 1;
  if (order >= 10 && order <= 15) return 2;
  if (order >= 16 && order <= 20) return 3;
  return 0;
};

/**
 * Calculates the phase completion bonus based on the phase number.
 * @param {number} phase - The phase number (1, 2, or 3).
 * @returns {number} The bonus XP amount.
 */
const getPhaseBonus = (phase) => {
  if (phase === 1) return XP.MODULE.PHASE_1_BONUS;
  if (phase === 2) return XP.MODULE.PHASE_2_BONUS;
  if (phase === 3) return XP.MODULE.PHASE_3_BONUS;
  return 0;
};

/**
 * Calculates XP earned for a lesson quiz answer based on the number of attempts.
 * @param {number} attempts - Number of attempts made on the quiz.
 * @returns {number} The XP earned.
 */
const calculateLessonQuizXP = (attempts) => {
  if (attempts <= 1) return XP.LESSON_QUIZ.CORRECT.FIRST_ATTEMPT;
  if (attempts === 2) return XP.LESSON_QUIZ.CORRECT.SECOND_ATTEMPT;
  if (attempts === 3) return XP.LESSON_QUIZ.CORRECT.THIRD_ATTEMPT;
  return XP.LESSON_QUIZ.CORRECT.FOURTH_PLUS;
};

/**
 * Calculates XP earned for a coding exercise based on submissions and first-try success.
 * @param {number} submissionCount - Total number of submission attempts.
 * @param {boolean} isFirstTryPass - Whether it passed on the first try.
 * @returns {number} The total XP earned for the exercise.
 */
const calculateExerciseXP = (submissionCount, isFirstTryPass) => {
  let xp = Math.min(
    submissionCount * XP.EXERCISE.SUBMISSION_BASE,
    XP.EXERCISE.MAX_SUBMISSION_XP,
  );
  if (isFirstTryPass) {
    xp += XP.EXERCISE.FIRST_TRY_BONUS;
  }
  return xp;
};

/**
 * Calculates total XP and itemized breakdown for completing a module.
 * @param {Object} params - The completion parameters.
 * @param {number} params.order - The module order number.
 * @param {number} [params.phase] - Optional phase number.
 * @param {Array<Object>} [params.quizResults] - Array of quiz result objects containing `isCorrect`.
 * @returns {Object} An object containing the total XP and an array breakdown of sources.
 */
const calculateModuleCompletionXP = ({ order, phase, quizResults = [] }) => {
  const breakdown = [];
  const add = (amount, source, meta = {}) =>
    amount > 0 && breakdown.push({ amount, source, meta });

  const currentPhase = phase ?? getModulePhase(order);

  if (order !== 0 && quizResults.length) {
    const correct = quizResults.filter((r) => r.isCorrect).length;
    add(correct * XP.MODULE_QUIZ.CORRECT_ANSWER, "MODULE_QUIZ", { correct });
    add(XP.MODULE_QUIZ.COMPLETION_BONUS, "MODULE_QUIZ", {
      completionBonus: true,
    });
    if (correct === quizResults.length)
      add(XP.MODULE_QUIZ.PERFECT_SCORE_BONUS, "MODULE_QUIZ", {
        perfectScore: true,
      });
  }

  add(
    XP.MODULE.COMPLETION_BONUS + getPhaseBonus(currentPhase),
    "MODULE_COMPLETION",
    {
      phase: currentPhase,
    },
  );

  if (order === 0)
    add(XP.SPECIAL.M0_COMPLETION, "MODULE_COMPLETION", { reason: "tutorial" });

  add(getModuleRewardXp(order), "BONUS", { reason: "module_reward" });

  if (order === 20)
    add(XP.SPECIAL.M20_PROJECT_BONUS, "BONUS", { reason: "capstone" });

  return { total: breakdown.reduce((s, b) => s + b.amount, 0), breakdown };
};

module.exports = {
  getModuleRewardXp,
  getModulePhase,
  getPhaseBonus,
  calculateLessonQuizXP,
  calculateExerciseXP,
  calculateModuleCompletionXP,
};
