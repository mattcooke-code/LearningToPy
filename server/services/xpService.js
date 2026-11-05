// xpService.js
const XP = require("../constants/xpConstants");

const calculateModuleCompletionXP = ({ order, phase, quizResults = [] }) => {
  const breakdown = [];
  const add = (amount, source, meta = {}) =>
    amount > 0 && breakdown.push({ amount, source, meta });

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
  add(XP.MODULE.COMPLETION_BONUS + getPhaseBonus(phase), "MODULE_COMPLETION", {
    phase,
  });
  if (order === 0)
    add(XP.SPECIAL.M0_COMPLETION, "MODULE_COMPLETION", { reason: "tutorial" });
  add(getModuleRewardXp(order), "BONUS", { reason: "module_reward" });
  if (order === 20)
    add(XP.SPECIAL.M20_PROJECT_BONUS, "BONUS", { reason: "capstone" });

  return { total: breakdown.reduce((s, b) => s + b.amount, 0), breakdown };
};

const getModuleRewardXp = (order) => {
  return MODULE_REWARDS[order]?.xpReward ?? 100;
};

const getModulePhase = (order) => {
  if (order >= 1 && order <= 9) return 1;
  if (order >= 10 && order <= 15) return 2;
  if (order >= 16 && order <= 20) return 3;
  return 0;
};

// Helper: Calculate XP for a lesson quiz answer based on attempts
const calculateLessonQuizXP = (attempts) => {
  if (attempts <= 1) return XP.LESSON_QUIZ.CORRECT.FIRST_ATTEMPT;
  if (attempts === 2) return XP.LESSON_QUIZ.CORRECT.SECOND_ATTEMPT;
  if (attempts === 3) return XP.LESSON_QUIZ.CORRECT.THIRD_ATTEMPT;
  return XP.LESSON_QUIZ.CORRECT.FOURTH_PLUS;
};

// Helper: Calculate XP for a coding exercise
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

// Helper: Get module phase bonus
const getPhaseBonus = (phase) => {
  if (phase === 1) return XP.MODULE.PHASE_1_BONUS;
  if (phase === 2) return XP.MODULE.PHASE_2_BONUS;
  if (phase === 3) return XP.MODULE.PHASE_3_BONUS;
  return 0;
};

module.exports = {
  calculateModuleCompletionXP,
  getModuleRewardXp,
  getModulePhase,
  calculateLessonQuizXP,
  calculateExerciseXP,
  getPhaseBonus,
};
