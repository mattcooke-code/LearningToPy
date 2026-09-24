// learningEngine.js
const CourseCompletion = require("../models/CourseCompletion");
const Lesson = require("../models/Lesson");
const Module = require("../models/Module");
const LessonCompletion = require("../models/LessonCompletion");
const ModuleCompletion = require("../models/ModuleCompletion");
const XpTransaction = require("../models/XpTransaction");
const { findNextLesson, findNextModule } = require("../utils/navigation");
const { normalizeTags } = require("../utils/generalUtils");
const {
  XP,
  THRESHOLDS,
  calculateLessonQuizXP,
  calculateExerciseXP,
  getPhaseBonus,
} = require("../../shared/constants/progress.cjs");
const {
  getQuizResultsForXP,
  hasExercise,
  hasQuiz,
  isQuizCompleted,
} = require("../utils/quizHelpers");

/**
 * --- VALIDATION LOGIC ---
 */

/**
 * Validates a user's code submission against the exercise requirements.
 *
 * @param {string} userCode - The code submitted by the user
 * @param {Object} exercise - The exercise document with starterCode
 * @param {string} exercise.starterCode - The initial code template
 * @returns {{ isCorrect: boolean, feedback: string }} Validation result
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

/**
 * Increments user statistics based on lesson completion performance.
 * Tracks speed, accuracy, and tag-based challenge categories.
 * Mutates the user object directly.
 *
 * @param {Object} user - The user document (mutated in place)
 * @param {Object} lessonRecord - The lesson completion record
 * @param {Object} submissionBody - Submission metadata from the frontend
 */
const updateUserStats = (user, lessonRecord, submissionBody) => {
  user.stats = user.stats || {};
  const { elapsedSeconds, usedHints, attemptNumber, wasOptimalSolution } =
    submissionBody;
  const isChallenge = lessonRecord.contentType !== "THEORY";

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

/**
 * Creates a standardized lesson completion record for history tracking.
 *
 * @param {Object} lesson - The lesson document
 * @param {Object} submissionBody - Submission metadata
 * @param {Date} timestamp - Completion timestamp
 * @returns {Object} Formatted completion record
 */
const createLessonCompletionRecord = (lesson, submissionBody, timestamp) => {
  return {
    lessonId: lesson._id,
    completedAt: timestamp,
    tags: normalizeTags(lesson.tags),
    contentType: lesson.contentType,
    difficulty: lesson.difficulty,
    challengeGroup: lesson.challengeGroup?.toLowerCase(),
    elapsedSeconds: submissionBody.elapsedSeconds,
    attemptNumber: submissionBody.attemptNumber,
    usedHints: !!submissionBody.usedHints,
    linesOfCode: submissionBody.linesOfCode,
    wasOptimal: !!submissionBody.wasOptimalSolution,
  };
};

/**
 * Bulk-insert XP transactions for a completion event.
 *
 * @param {string} userId - The user's ID
 * @param {Array} xpLog - Array of { amount, source, meta } objects
 * @returns {Promise<Array>} The created XpTransaction documents
 */
const createXpTransactions = async (userId, xpLog) => {
  if (xpLog.length === 0) return [];

  const transactions = xpLog.map((log) => ({
    userId,
    amount: log.amount,
    source: log.source,
    meta: log.meta,
    awardedAt: new Date(),
  }));

  return XpTransaction.insertMany(transactions);
};

/**
 * Record the user's course completion
 *
 * @param {Object} user - User document (mutated: leaderboardStatus)
 * @param {number} moduleCount - Total modules completed by the user
 * @returns {Promise<Date|null>} The hofEligibleAt date, or null if already completed
 */
const recordCourseCompletion = async (user, moduleCount) => {
  const existing = await CourseCompletion.findOne({ userId: user._id });
  if (existing) return null;

  const now = new Date();
  const hofDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await CourseCompletion.create({
    userId: user._id,
    completedAt: now,
    timeToCompleteMs: now.getTime() - user.createdAt.getTime(),
    totalXpAtCompletion: user.xp, // ← reads post-completion total
    moduleCount,
    hofEligibleAt: hofDate,
  });

  user.leaderboardStatus = "COMPLETED_PENDING";
  return hofDate;
};

/**
 * Main Orchestrator for Lesson Completion.
 *
 * Handles XP calculation across multiple sources, writes to the new
 * LessonCompletion, ModuleCompletion, and XpTransaction collections,
 * and updates the User document (xp, level, stats, counters) in place.
 *
 * **XP Sources (awarded in order):**
 * 1. Exercise submission XP
 * 2. Lesson quiz XP (per-question + passing bonus)
 * 3. Base lesson completion XP
 * 4. Project lesson bonus
 * 5. Capstone project bonus (Module 20)
 * 6. Module config reward
 * 7. Auto-completed module bonus (quiz-less modules)
 *
 * @param {Object} user - The user document (mutated: xp, level, stats)
 * @param {Object} lesson - The lesson being completed
 * @param {Object} submissionBody - Submission data from the frontend
 * @returns {Promise<{
 *   xpIncrease: number,
 *   newlyCompleted: boolean,
 *   nextLessonId: string|null,
 *   xpBreakdown: Array
 * }>}
 */
const processLessonCompletion = async (user, lesson, submissionBody) => {
  const lessonId = lesson._id.toString();
  const userId = user._id.toString();

  // ── 1. Duplicate-completion guard ────────────────────
  const existingCompletion = await LessonCompletion.findOne({
    userId,
    lessonId,
  });
  if (existingCompletion) {
    return {
      xpIncrease: 0,
      newlyCompleted: false,
      nextLessonId: await findNextLesson(lesson),
    };
  }

  // ── 2. Module context ────────────────────────────────
  const module = await Module.findById(lesson.moduleId)
    .select("order phase")
    .lean();
  const moduleOrder = module?.order;
  const isM0 = moduleOrder === 0;
  const isProjectLesson = lesson.contentType === "PROJECT";
  const isFinalModule = moduleOrder === 20 && isProjectLesson;

  let totalXP = 0;
  const xpLog = [];

  // ── 3. Compute lesson-level XP ───────────────────────
  // A. Exercise XP
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

  // B. Lesson Quiz XP
  if (hasQuiz(lesson) && !isM0) {
    const quizProgress =
      submissionBody.quizProgress ||
      user.lessonQuizProgress?.find(
        (qp) => qp.lessonId?.toString() === lessonId,
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

  // C. Base Lesson Completion
  totalXP += XP.LESSON.COMPLETION;
  xpLog.push({
    amount: XP.LESSON.COMPLETION,
    source: "LESSON_COMPLETION",
    meta: { lessonId },
  });

  // D. Project Lesson Bonus
  if (isProjectLesson) {
    totalXP += XP.LESSON.PROJECT_BONUS;
    xpLog.push({
      amount: XP.LESSON.PROJECT_BONUS,
      source: "BONUS",
      meta: { lessonId, reason: "project_lesson" },
    });
  }

  // E. Final Project Override
  if (isFinalModule) {
    totalXP += XP.SPECIAL.M20_PROJECT_BONUS;
    xpLog.push({
      amount: XP.SPECIAL.M20_PROJECT_BONUS,
      source: "BONUS",
      meta: { lessonId, reason: "capstone_project" },
    });
  }

  // F. Add Module Specific XP
  if (submissionBody.moduleConfigReward && !isM0) {
    totalXP += submissionBody.moduleConfigReward;
    xpLog.push({
      amount: submissionBody.moduleConfigReward,
      source: "BONUS",
      meta: { lessonId, reason: "module_config_reward" },
    });
  }

  // ── 4. Detect auto-completion (module has no quiz) ───
  //    Detection only. No writes yet. No XP added yet.
  let willAutoComplete = false;
  let autoCompleteModule = null;
  let autoCompleteModuleBonus = 0;

  if (!isM0 && !hasQuiz(lesson)) {
    const moduleLessons = await Lesson.find({
      moduleId: lesson.moduleId,
      isPublished: true,
    })
      .select("_id")
      .lean();

    const moduleLessonIds = moduleLessons.map((l) => l._id.toString());

    // Check if all lessons in this module are now completed
    const completedLessonRecords = await LessonCompletion.find({
      userId,
      lessonId: { $in: moduleLessonIds },
    }).lean();

    const completedLessonIds = completedLessonRecords.map((lc) =>
      lc.lessonId.toString(),
    );

    // Note: the current lesson isn't yet marked complete in the DB,
    // so we check for *all but this one* and then add this one.
    const allOthersComplete = moduleLessonIds
      .filter((id) => id !== lessonId)
      .every((id) => completedLessonIds.includes(id));

    if (allOthersComplete) {
      const fullModule = await Module.findById(lesson.moduleId);
      const moduleHasQuiz = hasQuiz(fullModule);

      if (!moduleHasQuiz) {
        // Module has no quiz - auto-complete it
        const existingModuleCompletion = await ModuleCompletion.findOne({
          userId,
          moduleId: fullModule._id,
        });

        if (!existingModuleCompletion) {
          willAutoComplete = true;
          autoCompleteModule = fullModule;

          // Award module completion XP
          const modulePhase = fullModule.phase || 1;
          autoCompleteModuleBonus =
            XP.MODULE.COMPLETION_BONUS + getPhaseBonus(modulePhase);

          totalXP += autoCompleteModuleBonus;

          // Special M20 capstone bonus
          if (fullModule.order === 20) {
            totalXP += XP.SPECIAL.M20_PROJECT_BONUS;
            xpLog.push({
              amount: XP.SPECIAL.M20_PROJECT_BONUS,
              source: "BONUS",
              meta: { lessonId, reason: "capstone_auto_complete" },
            });
          }

          xpLog.push({
            amount: autoCompleteModuleBonus,
            source: "MODULE_COMPLETION_AUTO",
            meta: { moduleId: fullModule._id.toString(), phase: modulePhase },
          });
        }
      }
    }
  }

  // ── 5. Update user XP ────────────────────────────────
  // Award XP and update level
  user.xp = (user.xp || 0) + totalXP;
  user.level = Math.floor(user.xp / XP.PER_LEVEL) + 1;
  user.completedLessonsCount = (user.completedLessonsCount || 0) + 1;

  // ── 6. Write XP transactions ─────────────────────────
  await createXpTransactions(userId, xpLog);

  // ── 7. Write completion records ──────────────────────
  const now = new Date();
  const record = createLessonCompletionRecord(lesson, submissionBody, now);
  await LessonCompletion.create({ userId, ...record });

  let autoCompletedModule = false;
  let courseCompleted = false;
  let hofEligibleAt = null;

  if (willAutoComplete) {
    await ModuleCompletion.create({
      userId,
      moduleId: autoCompleteModule._id,
      completedAt: now,
    });

    user.completedModulesCount = (user.completedModulesCount || 0) + 1;
    autoCompletedModule = true;
  }

  // ── 8. Record course completion if M20 just auto-completed ──
  if (autoCompletedModule && autoCompleteModule?.order === 20) {
    const moduleCount = await ModuleCompletion.countDocuments({ userId });
    const hofDate = await recordCourseCompletion(user, moduleCount);
    if (hofDate) {
      courseCompleted = true;
      hofEligibleAt = hofDate;
    }
  }

  // ── 9. Update stats ──────────────────────────────────
  updateUserStats(user, record, submissionBody);

  return {
    xpIncrease: totalXP,
    newlyCompleted: true,
    nextLessonId: await findNextLesson(lesson),
    xpBreakdown: xpLog,
    autoCompletedModule,
    courseCompleted,
    hofEligibleAt,
  };
};

/**
 * Main Orchestrator for Module Completion.
 *
 * @returns {Promise<{
 * xpIncrease: number,
 * newlyCompleted: boolean,
 * nextModuleId: string|null,
 * xpBreakdown: Array,
 * courseCompleted?: boolean,
 * hofEligibleAt?: Date
 * }>}
 */
const processModuleCompletion = async (
  user,
  module,
  quizScore,
  quizResults = [],
) => {
  const moduleId = module._id.toString();
  const userId = user._id.toString();

  // Helper to find the next module
  const nextModule = await findNextModule(module);

  // Prevent Duplicate Completion
  const existingCompletion = await ModuleCompletion.findOne({
    userId,
    moduleId,
  });

  if (existingCompletion) {
    return {
      xpIncrease: 0,
      newlyCompleted: false,
      nextModuleId: nextModule,
      xpBreakdown: [],
      courseCompleted: false,
    };
  }

  const isM0 = module.order === 0;
  const isM20 = module.order === 20;

  let totalXP = 0;
  const xpLog = [];

  // --- XP Calculation Logic (Keeping your original logic) ---
  if (!isM0 && Array.isArray(quizResults) && quizResults.length > 0) {
    const correctCount = quizResults.filter((r) => r.isCorrect).length;
    const quizXP = correctCount * XP.MODULE_QUIZ.CORRECT_ANSWER;
    totalXP += quizXP;
    xpLog.push({
      amount: quizXP,
      source: "MODULE_QUIZ",
      meta: { moduleId, correct: correctCount, total: quizResults.length },
    });

    totalXP += XP.MODULE_QUIZ.COMPLETION_BONUS;
    xpLog.push({
      amount: XP.MODULE_QUIZ.COMPLETION_BONUS,
      source: "MODULE_QUIZ",
      meta: { moduleId, completionBonus: true },
    });

    if (correctCount === quizResults.length) {
      totalXP += XP.MODULE_QUIZ.PERFECT_SCORE_BONUS;
      xpLog.push({
        amount: XP.MODULE_QUIZ.PERFECT_SCORE_BONUS,
        source: "MODULE_QUIZ",
        meta: { moduleId, perfectScore: true },
      });
    }
  }

  const completionBonus =
    XP.MODULE.COMPLETION_BONUS + getPhaseBonus(module.phase);
  totalXP += completionBonus;
  xpLog.push({
    amount: completionBonus,
    source: "MODULE_COMPLETION",
    meta: { moduleId, phase: module.phase },
  });

  if (isM20) {
    totalXP += XP.SPECIAL.M20_PROJECT_BONUS;
    xpLog.push({
      amount: XP.SPECIAL.M20_PROJECT_BONUS,
      source: "BONUS",
      meta: { moduleId, reason: "capstone_completion" },
    });
  }

  if (isM0) {
    totalXP += XP.SPECIAL.M0_COMPLETION;
    xpLog.push({
      amount: XP.SPECIAL.M0_COMPLETION,
      source: "MODULE_COMPLETION",
      meta: { moduleId, reason: "tutorial_completion" },
    });
  }

  if (module.xpReward && !isM0) {
    totalXP += module.xpReward;
    xpLog.push({
      amount: module.xpReward,
      source: "BONUS",
      meta: { moduleId, reason: "module_config_reward" },
    });
  }

  // --- Persistence ---
  await ModuleCompletion.create({
    userId,
    moduleId: module._id,
    completedAt: new Date(),
  });
  user.completedModulesCount = (user.completedModulesCount || 0) + 1;
  user.xp = (user.xp || 0) + totalXP;
  user.level = Math.floor(user.xp / XP.PER_LEVEL) + 1;
  await createXpTransactions(userId, xpLog);

  // --- Initialize Result Object ---
  const result = {
    xpIncrease: totalXP,
    newlyCompleted: true,
    nextModuleId: nextModule,
    xpBreakdown: xpLog,
    courseCompleted: false, // Default
  };

  // --- Course Completion Detection (M20) ---
  if (isM20) {
    const moduleCount = await ModuleCompletion.countDocuments({ userId });
    const hofDate = await recordCourseCompletion(user, moduleCount);
    if (hofDate) {
      result.courseCompleted = true;
      result.hofEligibleAt = hofDate;
    }
  }

  return result;
};

/**
 * Determines if a lesson is fully completed based on its content type.
 *
 * @param {Object} lesson - The lesson document
 * @param {Object} quizProgress - User's quiz progress for this lesson
 * @param {boolean} isCorrect - Whether the exercise solution is correct
 * @param {boolean} [forceComplete=false] - Skip all checks and mark complete
 * @returns {boolean} Whether the lesson is fully completed
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

  if (lesson.contentType === "THEORY") {
    if (lessonHasQuiz && !lessonHasExercise) {
      return isQuizCompleted(quizProgress, lesson);
    }
    if (!lessonHasQuiz && !lessonHasExercise) {
      return true;
    }
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
 * Now queries LessonCompletion collection instead of user.completedLessons array.
 *
 * @param {Object} user - The user document (requires _id)
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

  // Query LessonCompletion for completed lessons in curriculum modules
  const completedLessonIds = await LessonCompletion.find({
    userId: user._id,
  })
    .select("lessonId")
    .lean();

  const completedIdSet = new Set(
    completedLessonIds.map((lc) => lc.lessonId.toString()),
  );

  const completedCurriculumCount = await Lesson.countDocuments({
    _id: { $in: Array.from(completedIdSet) },
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
