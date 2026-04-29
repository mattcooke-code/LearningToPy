// learningEngine.js
const Lesson = require("../models/Lesson");
const Module = require("../models/Module");
const {
  findNextLesson,
  findNextModule,
  getNextModuleId,
} = require("./navigation");
const { normalizeTags } = require("./generalUtils");
const {
  XP,
  THRESHOLDS,
  calculateLessonQuizXP,
  calculateExerciseXP,
  getPhaseBonus,
} = require("../../shared/constants/progress");
const {
  getQuizResultsForXP,
  hasExercise,
  hasQuiz,
  isQuizCompleted,
} = require("./quizHelpers");

/**
 * --- VALIDATION LOGIC ---
 */
const validateCodeSubmission = (userCode, exercise) => {
  if (!userCode || userCode.trim() === "") {
    return {
      isCorrect: false,
      feedback: "No code submitted",
    };
  }
  if (userCode.trim() === exercise.starterCode?.trim()) {
    return { isCorrect: false, feedback: "Please modify the starter code!" };
  }

  return { isCorrect: true, feedback: "Code accepted (validated in frontend)" };
};

/**
 * --- STATS TRACKING ---
 */
const updateUserStats = (user, lessonRecord, submissionBody) => {
  user.stats = user.stats || {};
  const { elapsedSeconds, usedHints, attemptNumber, wasOptimalSolution } =
    submissionBody;
  const isChallenge = lessonRecord.contentType !== "theory";

  const ensureStat = (key) => {
    if (typeof user.stats[key] !== "number") user.stats[key] = 0;
  };

  if (isChallenge) {
    const tags = lessonRecord.tags || [];
    if (elapsedSeconds > 0 && elapsedSeconds <= 30) {
      ensureStat("fastChallengeCount");
      user.stats.fastChallengeCount++;
    }
    if (Number(attemptNumber) === 1 && !usedHints) {
      ensureStat("firstTryChallengeCount");
      user.stats.firstTryChallengeCount++;
    }
    if (wasOptimalSolution) {
      ensureStat("optimalSolutionCount");
      user.stats.optimalSolutionCount++;
    }

    if (tags.includes("functions")) {
      ensureStat("functionChallengeCount");
      user.stats.functionChallengeCount++;
    }
    if (tags.some((t) => ["api", "apis", "http"].includes(t))) {
      ensureStat("apiChallengeCount");
      user.stats.apiChallengeCount++;
    }
    if (tags.some((t) => ["files", "file-io"].includes(t))) {
      ensureStat("fileChallengeCount");
      user.stats.fileChallengeCount++;
    }
  }
};

/**
 * --- COMPLETION CORE ---
 */
const createLessonCompletionRecord = (lesson, submissionBody, timestamp) => {
  return {
    lessonId: lesson._id.toString(),
    completedAt: timestamp,
    tags: normalizeTags(lesson.tags),
    contentType: lesson.contentType,
    difficulty: lesson.difficulty,
    challengeGroup: lesson.challengeGroup?.toLowerCase(),
    elapsedSeconds: submissionBody.elapsedSeconds,
    attemptNumber: submissionBody.attemptNumber,
    usedHints: !!submissionBody.usedHints,
    wasOptimal: !!submissionBody.wasOptimalSolution,
  };
};

const ensureNotAlreadyCompleted = (completedArray, itemId) => {
  if (completedArray.includes(itemId)) {
    return {
      xpIncrease: 0,
      newlyCompleted: false,
      nextId: null,
    };
  }
  return null;
};

/**
 * Main Orchestrator for Lesson Completion.
 */
const processLessonCompletion = async (user, lesson, submissionBody) => {
  const lessonId = lesson._id.toString();

  // Prevent duplicate completion
  if (user.completedLessons.includes(lessonId)) {
    return {
      xpIncrease: 0,
      newlyCompleted: false,
      nextLessonId: await findNextLesson(lesson),
    };
  }

  // Module Definitions: Special Cases
  const module = await Module.findById(lesson.moduleId)
    .select("order phase")
    .lean();
  const moduleOrder = module?.order;
  const isM0 = moduleOrder === 0;
  const isProjectLesson = lesson.contentType === "PROJECT";
  const isFinalModule = moduleOrder === 20 && isProjectLesson;

  let totalXP = 0;
  const xpLog = [];

  // 1. Exercise XP
  if (hasExercise(lesson) && !isM0) {
    const submissions =
      submissionBody.submissionHistory ||
      (submissionBody.attemptNumber ? [submissionBody] : []);
    const submissionCount = Math.max(1, submissions.length);
    const firstTryPass =
      submissionCount === 1 &&
      (submissionBody.testsPassed || submissionBody.isCorrect);

    const exerciseXP = calculateExerciseXP(submissionCount, firstTryPass);
    totalXP += exerciseXP;

    xpLog.push({
      amount: exerciseXP,
      source: "EXERCISE",
      meta: { lessonId, submissions: submissionCount, firstTryPass },
    });
  }

  // 2. Lesson Quiz XP
  if (hasQuiz(lesson) && !isM0) {
    const quizProgress = user.lessonQuizProgress?.find(
      (qp) => qp.lessonId.toString() === lessonId,
    );

    if (quizProgress) {
      const results = getQuizResultsForXP(quizProgress, lesson);

      for (const result of results) {
        if (result.correct) {
          const quizXP = calculateLessonQuizXP(result.attempts);
          totalXP += quizXP;

          xpLog.push({
            amount: quizXP,
            source: "LESSON_QUIZ",
            meta: {
              lessonId,
              questionIndex: result.questionIndex,
              attempts: result.attempts,
            },
          });
        }
      }

      // Passing Bonus
      const correctCount = results.filter((r) => r.correct).length;
      const score = (correctCount / results.length) * 100;
      if (score >= THRESHOLDS.QUIZ.PASSING_SCORE) {
        totalXP += XP.LESSON_QUIZ.PASSING_BONUS;
        xpLog.push({
          amount: XP.LESSON_QUIZ.PASSING_BONUS,
          source: "LESSON_QUIZ",
          meta: { lessonId, score, passingBonus: true },
        });
      }
    }
  }

  // 3. Base Lesson Completion
  totalXP += XP.LESSON.COMPLETION;
  xpLog.push({
    amount: XP.LESSON.COMPLETION,
    source: "LESSON_COMPLETION",
    meta: { lessonId },
  });

  // 4. Project Lesson Bonus
  if (isProjectLesson) {
    totalXP += XP.LESSON.PROJECT_BONUS;
    xpLog.push({
      amount: XP.LESSON.PROJECT_BONUS,
      source: "BONUS",
      meta: { lessonId, reason: "project_lesson" },
    });
  }

  // 5. Final Project Override
  if (isFinalModule) {
    totalXP += XP.SPECIAL.M20_PROJECT_BONUS;
    xpLog.push({
      amount: XP.SPECIAL.M20_PROJECT_BONUS,
      source: "BONUS",
      meta: { lessonId, reason: "capstone_project" },
    });
  }

  // 6. Add Module Specific XP (moduleConfig.js)
  if (submissionBody.moduleConfigReward && !isM0) {
    totalXP += submissionBody.moduleConfigReward;
    xpLog.push({
      amount: submissionBody.moduleConfigReward,
      source: "BONUS",
      meta: { lessonId, reason: "module_config_reward" },
    });
  }

  // Award and Log XP
  user.xp = (user.xp || 0) + totalXP;
  user.level = Math.floor(user.xp / XP.PER_LEVEL) + 1;

  if (Array.isArray(user.xpHistory)) {
    user.xpHistory.push(
      ...xpLog.map((log) => ({ ...log, awardedAt: new Date() })),
    );
  }

  // Mark lesson as completed
  user.completedLessons.push(lessonId);

  // Create history & update stats
  const now = new Date();
  const record = createLessonCompletionRecord(lesson, submissionBody, now);
  user.lessonCompletionHistory.push(record);
  updateUserStats(user, record, submissionBody);

  return {
    xpIncrease: totalXP,
    newlyCompleted: true,
    nextLessonId: await findNextLesson(lesson),
    xpBreakdown: xpLog,
  };
};

/**
 * Main Orchestrator for Module Completion.
 */
const processModuleCompletion = async (
  user,
  module,
  quizScore,
  quizResults = [],
) => {
  const moduleId = module._id.toString();

  // Prevent Duplicate Completion
  if (user.completedModules.includes(moduleId)) {
    return {
      xpIncrease: 0,
      newlyCompleted: false,
      nextModuleId: await findNextModule(module),
    };
  }

  const isM0 = module.order === 0;
  const isM20 = module.order === 20;

  let totalXP = 0;
  const xpLog = [];

  // Module Quiz XP
  if (!isM0 && Array.isArray(quizResults) && quizResults.length > 0) {
    const correctCount = quizResults.filter((r) => r.isCorrect).length;

    // XP per correct answer
    const quizXP = correctCount * XP.MODULE_QUIZ.CORRECT_ANSWER;
    totalXP += quizXP;
    xpLog.push({
      amount: quizXP,
      source: "MODULE_QUIZ",
      meta: { moduleId, correct: correctCount, total: quizResults.length },
    });

    // Completion Bonus
    totalXP += XP.MODULE_QUIZ.COMPLETION_BONUS;
    xpLog.push({
      amount: XP.MODULE_QUIZ.COMPLETION_BONUS,
      source: "MODULE_QUIZ",
      meta: { moduleId, completionBonus: true },
    });

    // Perfect Score Bonus
    if (correctCount === quizResults.length) {
      totalXP += XP.MODULE_QUIZ.PERFECT_SCORE_BONUS;
      xpLog.push({
        amount: XP.MODULE_QUIZ.PERFECT_SCORE_BONUS,
        source: "MODULE_QUIZ",
        meta: { moduleId, perfectScore: true },
      });
    }
  }

  // Module Completion Bonus
  const completionBonus =
    XP.MODULE.COMPLETION_BONUS + getPhaseBonus(module.phase);
  totalXP += completionBonus;
  xpLog.push({
    amount: completionBonus,
    source: "MODULE_COMPLETION",
    meta: { moduleId, phase: module.phase },
  });

  // Final Module Capstone Bonus
  if (isM20) {
    totalXP += XP.SPECIAL.M20_PROJECT_BONUS;
    xpLog.push({
      amount: XP.SPECIAL.M20_PROJECT_BONUS,
      source: "BONUS",
      meta: { moduleId, reason: "capstone_completion" },
    });
  }

  // Tutorial Module - Small XP
  if (isM0) {
    totalXP += XP.SPECIAL.M0_COMPLETION;
    xpLog.push({
      amount: XP.SPECIAL.M0_COMPLETION,
      source: "MODULE_COMPLETION",
      meta: { moduleId, reason: "tutorial_completion" },
    });
  }

  // Add Module Specific XP (moduleConfig.js)
  if (module.xpReward && !isM0) {
    totalXP += module.xpReward;
    xpLog.push({
      amount: module.xpReward,
      source: "BONUS",
      meta: { moduleId, reason: "module_config_reward" },
    });
  }

  // Award XP and log history
  user.xp = (user.xp || 0) + totalXP;
  user.level = Math.floor(user.xp / XP.PER_LEVEL) + 1;

  if (!Array.isArray(user.moduleCompletionHistory)) {
    user.moduleCompletionHistory = [];
  }

  user.moduleCompletionHistory.push({
    moduleId: module._id,
    completedAt: new Date(),
    quizScore,
  });

  // CRITICAL: Add module to completedModules array
  if (!user.completedModules.includes(moduleId)) {
    user.completedModules.push(moduleId);
  }

  return {
    xpIncrease: totalXP,
    newlyCompleted: true,
    nextModuleId: await findNextModule(module),
    xpBreakdown: xpLog,
  };
};

/**
 * Check if lesson is fully completed based on its components
 */
const isLessonFullyCompleted = (
  lesson,
  quizProgress,
  isCorrect,
  forceComplete = false,
) => {
  const lessonHasQuiz = hasQuiz(lesson);
  const lessonHasExercise = hasExercise(lesson);

  if (forceComplete) return true;

  if (lesson.contentType === "THEORY" && !lessonHasQuiz && !lessonHasExercise) {
    return true;
  }

  if (lessonHasExercise && !lessonHasQuiz && isCorrect) {
    return true;
  }

  if (!lessonHasExercise && lessonHasQuiz) {
    return isQuizCompleted(quizProgress, lesson);
  }

  if (lessonHasExercise && lessonHasQuiz) {
    return isCorrect && isQuizCompleted(quizProgress, lesson);
  }

  return false;
};

/**
 * Calculates the current curriculum progress for a user.
 * @param {Object} user - The Mongoose user document
 * @param {Object} models - Object containing Lesson and Module models
 * @returns {Object} { totalCurriculumLessons, completedCurriculumCount }
 */
const getCurriculumProgressStats = async (user, { Lesson, Module }) => {
  const curriculumModules = await Module.find({
    order: { $gt: 0 },
    isPublished: true,
  }).select("_id");

  const curriculumModuleIds = curriculumModules.map((m) => m._id);

  const totalCurriculumLessons = await Lesson.countDocuments({
    isPublished: true,
    moduleId: { $in: curriculumModuleIds },
  });

  const completedCurriculumCount = await Lesson.countDocuments({
    _id: { $in: user.completedLessons },
    isPublished: true,
    moduleId: { $in: curriculumModuleIds },
  });

  return {
    totalCurriculumLessons,
    completedCurriculumCount,
  };
};

module.exports = {
  validateCodeSubmission,
  processLessonCompletion,
  processModuleCompletion,
  isLessonFullyCompleted,
  getCurriculumProgressStats,
};
