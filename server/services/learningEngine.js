// learningEngine.js
const Lesson = require("../models/Lesson");
const Module = require("../models/Module");
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
 *
 * @example
 * // Returns true for modified code
 * validateCodeSubmission("print('hello')", { starterCode: "# your code" })
 * // => { isCorrect: true, feedback: "Code accepted (validated in frontend)" }
 *
 * @example
 * // Returns false for empty or unchanged code
 * validateCodeSubmission("", { starterCode: "# template" })
 * // => { isCorrect: false, feedback: "No code submitted" }
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
 * @param {number} [submissionBody.elapsedSeconds] - Time taken to complete
 * @param {number} [submissionBody.attemptNumber] - Number of attempts
 * @param {boolean} [submissionBody.usedHints] - Whether hints were used
 * @param {boolean} [submissionBody.wasOptimalSolution] - Whether solution was optimal
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

/**
 * Creates a standardized lesson completion record for history tracking.
 *
 * @param {Object} lesson - The lesson document
 * @param {Object} submissionBody - Submission metadata
 * @param {Date} timestamp - Completion timestamp
 * @returns {Object} Formatted completion record with normalized tags and metadata
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

/**
 * Main Orchestrator for Lesson Completion.
 */

/**
 * Orchestrates the complete lesson completion workflow.
 *
 * Handles XP calculation across multiple sources (exercise, quiz, bonuses),
 * auto-completes quiz-less modules when all lessons are done (e.g., Module 20 capstone),
 * updates user XP/level/stats/history, and returns navigation info.
 *
 * **XP Sources (awarded in order):**
 * 1. Exercise submission XP (if lesson has coding exercise, skipped for M0)
 * 2. Lesson quiz XP (per-question + passing bonus, skipped for M0)
 * 3. Base lesson completion XP (always awarded)
 * 4. Project lesson bonus (if contentType === "PROJECT")
 * 5. Capstone project bonus (if Module 20 project lesson)
 * 6. Module config reward (if provided in submissionBody)
 * 7. Auto-completed module bonus (if all lessons done and module has no quiz)
 *
 * **Auto-completion behavior:**
 * For modules without a quiz (e.g., Module 20 capstone), completing the final
 * lesson triggers automatic module completion. This awards the module completion
 * bonus, phase bonus, and any special module bonuses (M20 capstone).
 *
 * @param {Object} user - The user document (mutated with new XP, level, history)
 * @param {Object} lesson - The lesson being completed
 * @param {Object} submissionBody - Submission data from the frontend
 * @param {Array} [submissionBody.submissionHistory] - Array of previous code submissions
 * @param {number} [submissionBody.attemptNumber] - Attempt count
 * @param {boolean} [submissionBody.testsPassed] - Whether all tests passed
 * @param {boolean} [submissionBody.isCorrect] - Whether solution is correct
 * @param {number} [submissionBody.moduleConfigReward] - Additional XP from module config
 * @param {Object} [submissionBody] - Additional metadata for stats tracking
 *
 * @returns {Promise<{
 *   xpIncrease: number,
 *   newlyCompleted: boolean,
 *   nextLessonId: string|null,
 *   xpBreakdown: Array<{amount: number, source: string, meta: Object}>
 * }>} Completion result with XP breakdown and navigation
 *
 * @example
 * // Completing a coding exercise lesson in Module 5
 * const result = await processLessonCompletion(user, lesson, {
 *   submissionHistory: [{ code: "print('hello')" }],
 *   attemptNumber: 1,
 *   testsPassed: true,
 *   isCorrect: true,
 *   elapsedSeconds: 45
 * });
 * // => { xpIncrease: 35, newlyCompleted: true, nextLessonId: "...", ... }
 *
 * @throws {Error} If Module.findById fails (module not found)
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

  // Mark lesson as completed
  user.completedLessons.push(lessonId);

  // Auto-complete quiz-less modules (e.g., Module 20 capstone)
  // This must happen BEFORE awarding XP so all XP is counted correctly
  if (!isM0 && !hasQuiz(lesson)) {
    const moduleLessons = await Lesson.find({
      moduleId: lesson.moduleId,
      isPublished: true,
    })
      .select("_id")
      .lean();

    const allLessonsComplete = moduleLessons.every((l) =>
      user.completedLessons.includes(l._id.toString()),
    );

    if (allLessonsComplete) {
      const fullModule = await Module.findById(lesson.moduleId);
      const moduleQuiz = hasQuiz(fullModule);

      if (!moduleQuiz) {
        // Module has no quiz - mark it complete now
        if (!user.completedModules.includes(fullModule._id.toString())) {
          user.completedModules.push(fullModule._id.toString());

          // Award module completion XP
          const modulePhase = fullModule.phase || 1;
          const moduleBonus =
            XP.MODULE.COMPLETION_BONUS + getPhaseBonus(modulePhase);

          // Special M20 capstone bonus
          if (fullModule.order === 20) {
            totalXP += XP.SPECIAL.M20_PROJECT_BONUS;
            xpLog.push({
              amount: XP.SPECIAL.M20_PROJECT_BONUS,
              source: "BONUS",
              meta: { lessonId, reason: "capstone_auto_complete" },
            });
          }

          totalXP += moduleBonus;
          xpLog.push({
            amount: moduleBonus,
            source: "MODULE_COMPLETION_AUTO",
            meta: { moduleId: fullModule._id.toString(), phase: modulePhase },
          });

          // Add to module completion history
          if (!Array.isArray(user.moduleCompletionHistory)) {
            user.moduleCompletionHistory = [];
          }
          user.moduleCompletionHistory.push({
            moduleId: fullModule._id,
            completedAt: new Date(),
            quizScore: null,
          });
        }
      }
    }
  }

  // Award and Log XP (now includes lesson + any auto-completed module XP)
  user.xp = (user.xp || 0) + totalXP;
  user.level = Math.floor(user.xp / XP.PER_LEVEL) + 1;

  if (Array.isArray(user.xpHistory)) {
    user.xpHistory.push(
      ...xpLog.map((log) => ({ ...log, awardedAt: new Date() })),
    );
  }

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

/**
 * Orchestrates the complete module completion workflow.
 *
 * Awards XP for module quiz performance, module completion, phase bonuses,
 * and special module bonuses (M0 tutorial, M20 capstone). Updates user
 * XP/level and adds to moduleCompletionHistory.
 *
 * @param {Object} user - The user document (mutated with new XP, level, history)
 * @param {Object} module - The module being completed
 * @param {number|null} quizScore - The quiz score (0-100), or null if no quiz
 * @param {Array} [quizResults=[]] - Individual quiz question results
 * @param {boolean} quizResults[].isCorrect - Whether the answer was correct
 *
 * @returns {Promise<{
 *   xpIncrease: number,
 *   newlyCompleted: boolean,
 *   nextModuleId: string|null,
 *   xpBreakdown: Array<{amount: number, source: string, meta: Object}>
 * }>} Completion result with XP breakdown and navigation
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

/**
 * Determines if a lesson is fully completed based on its content type and required components.
 *
 * A lesson is complete when all its interactive components are satisfied:
 * - Theory-only lessons: always complete
 * - Exercise lessons: code must be correct
 * - Quiz lessons: all quiz questions answered
 * - Exercise + Quiz lessons: both must be satisfied
 *
 * @param {Object} lesson - The lesson document
 * @param {Object} quizProgress - User's quiz progress for this lesson
 * @param {boolean} isCorrect - Whether the exercise solution is correct
 * @param {boolean}  - Skip all checks and mark complete
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

  // THEORY Lessons: quiz only (no exercise)
  if (lesson.contentType === "THEORY") {
    if (lessonHasQuiz && !lessonHasExercise) {
      return isQuizCompleted(quizProgress, lesson);
    }

    // Theory with no quiz
    if (!lessonHasQuiz && !lessonHasExercise) {
      return true;
    }
  }

  // PROJECT (exercise only, no quiz)
  if (lessonHasExercise && !lessonHasQuiz && isCorrect) {
    return true;
  }

  // Quiz only (catch-all for lessons without exercise not marked as Theory)
  if (!lessonHasExercise && lessonHasQuiz) {
    return isQuizCompleted(quizProgress, lesson);
  }

  // EXERCISE (coding exercise AND quiz)
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
