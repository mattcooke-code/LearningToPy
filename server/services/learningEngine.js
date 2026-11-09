// learningEngine.js
// ─────────────── IMPORTS ──────────────────
// ---MODELS---
const CourseCompletion = require("../models/CourseCompletion");
const Lesson = require("../models/Lesson");
const Module = require("../models/Module");
const LessonQuizProgress = require("../models/LessonQuizProgress");
const LessonCompletion = require("../models/LessonCompletion");
const ModuleCompletion = require("../models/ModuleCompletion");
const QuizAttempt = require("../models/QuizAttempt");
const User = require("../models/User");
const XpTransaction = require("../models/XpTransaction");
// ---SERVICES---
const analytics = require("./analytics");
const gamification = require("./gamification");
const moduleProgress = require("./moduleProgress");
const streakManager = require("./streakManager");
const xpService = require("./xpService");
// ---UTILITIES---
const AppError = require("../utils/AppError");
const exerciseHelpers = require("../utils/exerciseHelpers");
const navigation = require("../utils/navigation");
const generalUtils = require("../utils/generalUtils");
const levelUtils = require("../utils/levelUtils");
const quizHelpers = require("../utils/quizHelpers");
// ---CONSTANTS---
const { XP, THRESHOLDS } = require("../constants/xpConstants");

// +=============================================+
// |              HELPERS                        |
// +=============================================+

// ───────── PURE HELPERS ─────────

/**
 * Validates a user's code submission against the exercise requirements.
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
 * Creates a standardized lesson completion record for history tracking.
 */
const createLessonCompletionRecord = (lesson, submissionBody, timestamp) => {
  return {
    lessonId: lesson._id,
    completedAt: timestamp,
    tags: generalUtils.normalizeTags(lesson.tags),
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
 * Increments user statistics based on lesson completion performance.
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

// ───────── PERSISTENCE HELPERS ─────────

/**
 * Bulk-insert XP transactions for a completion event.
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
 */
const recordCourseCompletion = async (user, moduleCount) => {
  const now = new Date();
  const hofDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  try {
    const existing = await CourseCompletion.findOneAndUpdate(
      { userId: user._id },
      {
        $setOnInsert: {
          userId: user._id,
          completedAt: now,
          timeToCompleteMs: now.getTime() - user.createdAt.getTime(),
          totalXpAtCompletion: user.xp,
          moduleCount,
          hofEligibleAt: hofDate,
        },
      },
      { upsert: true, new: true, rawResult: true },
    );

    if (existing.lastErrorObject.updatedExisting) {
      return null; // Already completed
    }

    user.leaderboardStatus = "COMPLETED_PENDING";
    return hofDate;
  } catch (err) {
    // Handle potential duplicate key race condition edge cases
    if (err.code === 11000) return null;
    throw err;
  }
};

/**
 * Helper: Find user or throw 404 error
 */
const findUserOrThrow = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  return user;
};

/**
 * Helper: Award XP and recalculate level
 */
const awardUserXp = (user, xpAmount) => {
  user.xp = (user.xp || 0) + xpAmount;
};

/**
 * Lesson-level quiz/exercise XP is not payable in Module 0 (tutorial).
 * Single check used by every lesson XP path.
 */
const isLessonXpEligible = (moduleOrder) =>
  !(moduleOrder === 0 && XP.SPECIAL.M0_NO_QUIZ_EXERCISE_XP);

/**
 * Build the XP log entry for a passed exercise.
 * Called wherever exercise XP is paid so both paths use identical maths.
 */
const buildExerciseXpEntry = (lessonId, exerciseProgress) => {
  const submissionCount = exerciseProgress?.attemptCount || 1;
  const isFirstTry = !!exerciseProgress?.firstAttemptPassed;
  return {
    amount: xpService.calculateExerciseXP(submissionCount, isFirstTry),
    source: "EXERCISE",
    meta: { lessonId, submissionCount, isFirstTry },
  };
};

/**
 * Build the XP log entry for a correct lesson-quiz answer.
 */
const buildQuizAnswerXpEntry = (lessonId, questionIndex, attempts) => ({
  amount: xpService.calculateLessonQuizXP(attempts),
  source: "LESSON_QUIZ",
  meta: { lessonId, questionIndex, attempts },
});

/**
 * Order of the final module: a 1-lesson capstone project with no module quiz.
 * It is the ONLY module that auto-completes (so the whole course can complete
 * when the capstone is submitted). Every other module completes by passing
 * its module quiz. M0 is an optional tutorial and never auto-completes.
 */
const FINAL_MODULE_ORDER = 20;

/**
 * Whether a MODULE has an end-of-module quiz.
 * Note: quizHelpers.hasQuiz() checks `lesson.quiz` (lesson-level quizzes) and
 * always returns false for a Module document - do not use it for modules.
 */
const hasModuleQuiz = (module) => !!module?.moduleQuiz?.questions?.length;

/**
 * Convert a calculateModuleCompletionXP breakdown into XpTransaction log
 * entries, merging in caller-specific meta (moduleId, lessonId, ...).
 */
const toXpLog = (breakdown, extraMeta = {}) =>
  breakdown.map((b) => ({ ...b, meta: { ...extraMeta, ...b.meta } }));

/**
 * Helper: Check and record course completion for M20
 */
const checkAndRecordCourseCompletion = async (user, userId, isM20) => {
  if (!isM20) return { courseCompleted: false, hofEligibleAt: null };
  const moduleCount = await ModuleCompletion.countDocuments({ userId });
  const hofDate = await recordCourseCompletion(user, moduleCount);
  return {
    courseCompleted: !!hofDate,
    hofEligibleAt: hofDate || null,
  };
};

// ───────── QUERY HELPERS ─────────

/**
 * Fetch all completion data for a user from collections.
 */
const fetchUserCompletionData = async (userId, { fullDocs = false } = {}) => {
  const [lessonCompletions, moduleCompletions, quizAttempts] =
    await Promise.all([
      LessonCompletion.find({ userId })
        .select(fullDocs ? undefined : "lessonId")
        .lean(),
      ModuleCompletion.find({ userId })
        .select(fullDocs ? undefined : "moduleId")
        .lean(),
      QuizAttempt.find({ userId }).select("moduleId score passed").lean(),
    ]);

  return {
    completedLessons: lessonCompletions.map((lc) =>
      (lc.lessonId?._id || lc.lessonId || lc._id).toString(),
    ),
    completedModules: moduleCompletions.map((mc) =>
      (mc.moduleId?._id || mc.moduleId || mc._id).toString(),
    ),
    quizAttempts,
    lessonCompletions: fullDocs ? lessonCompletions : undefined,
    moduleCompletions: fullDocs ? moduleCompletions : undefined,
  };
};

/**
 * Fetch all published lessons for a set of module IDs in one query,
 * grouped by moduleId for O(1) lookup.
 *
 * @param {string[]} moduleIds
 * @returns {Promise<Object<string, Object[]>>} Map of moduleId → lessons array
 */
const fetchLessonsByModule = async (moduleIds) => {
  const allLessons = await Lesson.find({
    moduleId: { $in: moduleIds },
    isPublished: true,
  })
    .select("_id moduleId")
    .lean();

  const lessonsByModule = {};
  allLessons.forEach((lesson) => {
    const key = lesson.moduleId.toString();
    if (!lessonsByModule[key]) lessonsByModule[key] = [];
    lessonsByModule[key].push(lesson);
  });

  return lessonsByModule;
};

/**
 * Calculates the current curriculum progress for a user.
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

/**
 * Build the progress payload returned to the client after a completion event.
 */
const buildProgressResponse = async (user, { Lesson, Module }) => {
  const [{ totalCurriculumLessons, completedCurriculumCount }, completionData] =
    await Promise.all([
      getCurriculumProgressStats(user, { Lesson, Module }),
      fetchUserCompletionData(user._id, { fullDocs: true }),
    ]);

  return analytics.formatProgressResponse(
    user.toObject(),
    totalCurriculumLessons,
    completedCurriculumCount,
    null,
    null,
    {
      completedModules: completionData.completedModules,
      completedLessons: completionData.completedLessons,
      lessonCompletions: completionData.lessonCompletions,
      moduleCompletions: completionData.moduleCompletions,
    },
  );
};

// +=============================================+
// |              ORCHESTRATORS                  |
// +=============================================+

/**
 * Processes the successful completion of a lesson, calculating earned XP (including exercise,
 * quiz, and project bonuses), recording history, updating streak counts, handling potential
 * auto-completions for final modules (like M20), and returning a progress response package.
 *
 * @param {Object} user - The Mongoose user document of the student.
 * @param {Object} lesson - The Mongoose lesson document being completed.
 * @param {Object} submissionBody - Server-derived facts and statistics read from database state
 *                                  (e.g., exerciseJustPassed, justCorrectQuestion, attempt counts, hints).
 * @returns {Promise<Object>} - An object containing total XP increase, completion flags, next lesson navigation,
 *                              XP breakdown logs, and downstream course/module completion states.
 */
const processLessonCompletion = async (user, lesson, submissionBody) => {
  const lessonId = lesson._id.toString();
  const userId = user._id.toString();

  const existingCompletion = await LessonCompletion.findOne({
    userId,
    lessonId,
  });
  if (existingCompletion) {
    return {
      xpIncrease: 0,
      newlyCompleted: false,
      nextLessonId: await navigation.findNextLesson(lesson),
    };
  }

  const module = await Module.findById(lesson.moduleId)
    .select("order phase")
    .lean();
  const moduleOrder = module?.order;
  const isProjectLesson = lesson.contentType === "PROJECT";

  let totalXP = 0;
  const xpLog = [];

  // Exercise and quiz-answer XP is paid at the moment the event happens
  // (see partial XP in submitLessonAttempt). When that event is also the one
  // that completes the lesson, it is paid here instead - never both.
  const xpEligible = isLessonXpEligible(moduleOrder);

  if (xpEligible && submissionBody.exerciseJustPassed) {
    const exerciseProgress = await exerciseHelpers.getOrCreateExerciseProgress(
      userId,
      lessonId,
      lesson,
    );
    if (exerciseProgress?.passed) {
      const entry = buildExerciseXpEntry(lessonId, exerciseProgress);
      if (entry.amount > 0) {
        totalXP += entry.amount;
        xpLog.push(entry);
      }
    }
  }

  if (quizHelpers.hasQuiz(lesson) && xpEligible) {
    const quizProgress = await LessonQuizProgress.findOne({
      userId,
      lessonId,
    }).lean();

    if (quizProgress) {
      const results = quizHelpers.getQuizResultsForXP(quizProgress, lesson);

      // Only the answer submitted in this request is still unpaid; earlier
      // correct answers were paid when they were submitted.
      const justAnswered = results.find(
        (r) =>
          r.correct && r.questionIndex === submissionBody.justCorrectQuestion,
      );
      if (justAnswered) {
        const entry = buildQuizAnswerXpEntry(
          lessonId,
          justAnswered.questionIndex,
          justAnswered.attempts,
        );
        if (entry.amount > 0) {
          totalXP += entry.amount;
          xpLog.push(entry);
        }
      }

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

  totalXP += XP.LESSON.COMPLETION;
  xpLog.push({
    amount: XP.LESSON.COMPLETION,
    source: "LESSON_COMPLETION",
    meta: { lessonId },
  });

  if (isProjectLesson) {
    totalXP += XP.LESSON.PROJECT_BONUS;
    xpLog.push({
      amount: XP.LESSON.PROJECT_BONUS,
      source: "BONUS",
      meta: { lessonId, reason: "project_lesson" },
    });
  }

  let willAutoComplete = false;
  let autoCompleteModule = null;

  // Only the final module auto-completes. All other modules must pass their
  // module quiz, which is what creates the ModuleCompletion (and unlocks the
  // next module).
  if (moduleOrder === FINAL_MODULE_ORDER) {
    const moduleLessons = await Lesson.find({
      moduleId: lesson.moduleId,
      isPublished: true,
    })
      .select("_id")
      .lean();

    const moduleLessonIds = moduleLessons.map((l) => l._id.toString());

    const completedLessonRecords = await LessonCompletion.find({
      userId,
      lessonId: { $in: moduleLessonIds },
    }).lean();

    const completedLessonIds = completedLessonRecords.map((lc) =>
      lc.lessonId.toString(),
    );

    const allOthersComplete = moduleLessonIds
      .filter((id) => id !== lessonId)
      .every((id) => completedLessonIds.includes(id));

    if (allOthersComplete) {
      const fullModule = await Module.findById(lesson.moduleId);
      if (!hasModuleQuiz(fullModule)) {
        const existingModuleCompletion = await ModuleCompletion.findOne({
          userId,
          moduleId: fullModule._id,
        });

        if (!existingModuleCompletion) {
          willAutoComplete = true;
          autoCompleteModule = fullModule;

          // Same formula as the module-quiz path (no quiz results here).
          const { total, breakdown } = xpService.calculateModuleCompletionXP({
            order: fullModule.order,
          });
          totalXP += total;
          xpLog.push(
            ...toXpLog(breakdown, {
              lessonId,
              moduleId: fullModule._id.toString(),
            }).map((entry) =>
              entry.source === "MODULE_COMPLETION"
                ? { ...entry, source: "MODULE_COMPLETION_AUTO" }
                : entry,
            ),
          );
        }
      }
    }
  }

  const now = new Date();
  const record = createLessonCompletionRecord(lesson, submissionBody, now);
  await LessonCompletion.create({ userId, ...record });

  awardUserXp(user, totalXP);
  user.completedLessonsCount = (user.completedLessonsCount || 0) + 1;

  await createXpTransactions(userId, xpLog);

  let autoCompletedModule = false;
  let courseCompleted = false;
  let hofEligibleAt = null;

  if (willAutoComplete) {
    try {
      await ModuleCompletion.create({
        userId,
        moduleId: autoCompleteModule._id,
        completedAt: now,
      });

      user.completedModulesCount = (user.completedModulesCount || 0) + 1;

      // Update User Level
      if (autoCompleteModule.order > 0) {
        user.level = Math.min(20, Math.max(1, autoCompleteModule.order));
      }

      autoCompletedModule = true;
    } catch (err) {
      if (err.code === 11000) {
        // Duplicate Key Error - already completed
        autoCompletedModule = false;
      } else {
        throw err;
      }
    }
  }

  if (autoCompletedModule && autoCompleteModule?.order === 20) {
    const courseResult = await checkAndRecordCourseCompletion(
      user,
      userId,
      true,
    );
    courseCompleted = courseResult.courseCompleted;
    hofEligibleAt = courseResult.hofEligibleAt;
  }

  updateUserStats(user, record, submissionBody);

  return {
    xpIncrease: totalXP,
    newlyCompleted: true,
    nextLessonId: await navigation.findNextLesson(lesson),
    xpBreakdown: xpLog,
    autoCompletedModule,
    courseCompleted,
    hofEligibleAt,
  };
};

/**
 * Processes the successful completion of a module after a student passes its module quiz,
 * creating the module completion record, awarding module completion XP, updating user level
 * and completion counts, and triggering course completion checks for M20.
 *
 * @param {Object} user - The Mongoose user document of the student.
 * @param {Object} module - The Mongoose module document being completed.
 * @param {Array<Object>} [quizResults=[]] - Optional breakdown of the module quiz answers and results.
 * @returns {Promise<Object>} - An object containing total XP increase, completion state, next module ID,
 *                              XP transaction breakdown, and course completion status.
 */
const processModuleCompletion = async (user, module, quizResults = []) => {
  const moduleId = module._id.toString();
  const userId = user._id.toString();

  const nextModule = await navigation.findNextModule(module);

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

  const isM20 = module.order === 20;

  const { total: totalXP, breakdown } = xpService.calculateModuleCompletionXP({
    order: module.order,
    quizResults,
  });
  const xpLog = toXpLog(breakdown, { moduleId });

  await ModuleCompletion.create({
    userId,
    moduleId: module._id,
    completedAt: new Date(),
  });
  user.completedModulesCount = (user.completedModulesCount || 0) + 1;

  // Update User Level
  if (module.order > 0) {
    user.level = Math.min(20, Math.max(1, module.order));
  }

  awardUserXp(user, totalXP);
  await createXpTransactions(userId, xpLog);

  const result = {
    xpIncrease: totalXP,
    newlyCompleted: true,
    nextModuleId: nextModule,
    xpBreakdown: xpLog,
    courseCompleted: false,
  };

  if (isM20) {
    const courseResult = await checkAndRecordCourseCompletion(
      user,
      userId,
      isM20,
    );
    if (courseResult.courseCompleted) {
      result.courseCompleted = true;
      result.hofEligibleAt = courseResult.hofEligibleAt;
    }
  }

  return result;
};

/**
 * Determines whether a lesson is fully completed based on its type (theory, practice, exercise,
 * or quiz) and whether all prerequisite criteria have been met.
 *
 * @param {Object} lesson - The Mongoose lesson document being evaluated.
 * @param {Object} quizProgress - The user's quiz progress state for the lesson.
 * @param {boolean} exercisePassed - Whether the exercise component has been successfully passed.
 * @param {boolean} [forceComplete=false] - Optional override flag to force completion.
 * @returns {boolean} - Returns true if all required conditions are satisfied, otherwise false.
 */
const isLessonFullyCompleted = (
  lesson,
  quizProgress,
  exercisePassed,
  forceComplete = false,
) => {
  const lessonHasQuiz = quizHelpers.hasQuiz(lesson);
  const lessonHasExercise = exerciseHelpers.hasExercise(lesson);

  if (forceComplete) return true;

  if (!lessonHasQuiz && !lessonHasExercise) {
    return lesson.contentType === "THEORY";
  }

  const quizDone = lessonHasQuiz
    ? quizHelpers.isQuizCompleted(quizProgress, lesson)
    : true;

  const exerciseDone = lessonHasExercise ? exercisePassed : true;

  return quizDone && exerciseDone;
};

/**
 * Handles a student's attempt on a lesson, evaluating exercise code submissions
 * or quiz answers, tracking completion state, and awarding incremental or completion XP.
 * If the lesson is fully satisfied, it triggers downstream processing like course
 * completions, auto-completing modules (e.g., M20), streak tracking, and badge evaluations.
 *
 * @param {string} userId - The ID of the student making the attempt.
 * @param {string} lessonId - The ID of the lesson being attempted.
 * @param {Object} submissionBody - The details of the student's submission.
 * @param {number} [submissionBody.answer] - The selected numerical answer index for a lesson quiz question.
 * @param {string} [submissionBody.code] - The submitted source code for an exercise.
 * @param {number} [submissionBody.questionIndex=0] - The index of the quiz question being answered.
 * @param {Object} [submissionBody.validationResult] - Pre-validated feedback from the client/sandbox.
 * @param {boolean} [submissionBody.isCorrect=false] - Whether the submission passed validation.
 * @param {boolean} [submissionBody.usedHints=false] - Whether the student used hints during the attempt.
 * @param {number} [submissionBody.elapsedSeconds] - Time spent on the attempt in seconds.
 * @param {boolean} [submissionBody.wasOptimalSolution] - Whether the solution met optimal criteria.
 * @returns {Promise<Object>} - A response object containing feedback, completion status,
 *                              earned XP, updated dashboard progress, and unlocked badges.
 * @throws {AppError} 404 - If the lesson or user cannot be found.
 * @throws {AppError} 400 - If an empty code submission or invalid question index is provided.
 */
const submitLessonAttempt = async (userId, lessonId, submissionBody) => {
  const {
    answer,
    code,
    questionIndex = 0,
    validationResult,
    isCorrect = false,
    usedHints = false,
    elapsedSeconds,
    wasOptimalSolution,
  } = submissionBody;

  const lesson = await Lesson.findById(lessonId).populate(
    "moduleId",
    "order phase",
  );
  if (!lesson) throw new AppError("Lesson not found", 404);
  const moduleOrder = lesson.moduleId?.order;

  const user = await findUserOrThrow(userId);

  const exerciseProgress = await exerciseHelpers.getOrCreateExerciseProgress(
    userId,
    lessonId,
    lesson,
  );
  const quizProgress = await quizHelpers.getOrCreateQuizProgress(
    userId,
    lessonId,
    lesson,
  );

  const isExerciseSubmission =
    exerciseHelpers.hasExercise(lesson) && code !== undefined;
  const isQuizSubmission = quizHelpers.hasQuiz(lesson) && answer !== undefined;
  const isStatusCheckSubmission = !isExerciseSubmission && !isQuizSubmission;
  const lessonCompletesByStatusCheck =
    !exerciseHelpers.hasExercise(lesson) && !quizHelpers.hasQuiz(lesson);

  let feedback = validationResult?.feedback || "Great job!";
  let isCorrectForThisAction = false;
  let exerciseJustPassed = false;
  let alreadyCorrect = false;

  if (isExerciseSubmission) {
    if (!code || code.trim() === "")
      throw new AppError("No code submitted", 400);

    const serverValidation = validateCodeSubmission(code, lesson.exercise);
    if (!serverValidation.isCorrect) {
      return {
        message: serverValidation.feedback,
        payload: {
          isCorrect: false,
          feedback: serverValidation.feedback,
          completed: false,
          xpEarned: 0,
        },
      };
    }

    isCorrectForThisAction = isCorrect;
    const wasAlreadyPassed = exerciseProgress?.passed === true;

    await exerciseHelpers.recordExerciseAttempt(exerciseProgress, {
      passed: isCorrect,
      code,
      usedHints,
      wasOptimal: wasOptimalSolution,
      elapsedSeconds,
    });

    exerciseJustPassed = isCorrect && !wasAlreadyPassed;
    feedback = validationResult?.feedback || "Code submitted successfully";
  } else if (isQuizSubmission) {
    const currentQuestion = lesson.quiz[questionIndex];
    if (!currentQuestion) throw new AppError("Invalid question index", 400);

    isCorrectForThisAction = answer === currentQuestion.correctAnswer;

    alreadyCorrect = !!quizProgress?.questionAttempts?.some(
      (qa) => qa.questionIndex === questionIndex && qa.correct,
    );

    if (!alreadyCorrect) {
      await quizHelpers.updateQuizProgress(
        quizProgress,
        questionIndex,
        isCorrectForThisAction,
        lesson,
      );
    }

    if (isCorrectForThisAction) {
      feedback = `Correct! ${currentQuestion.explanation || ""}`;
    } else {
      feedback = `Try again! ${currentQuestion.explanation || ""}`;
    }
  }

  const existingLessonCompletion = await LessonCompletion.findOne({
    userId,
    lessonId,
  });
  const exercisePassed = exerciseProgress?.passed || false;

  const completed =
    !!existingLessonCompletion ||
    isLessonFullyCompleted(
      lesson,
      quizProgress,
      exercisePassed,
      isStatusCheckSubmission && lessonCompletesByStatusCheck,
    );

  if (completed) {
    const exercise = exerciseProgress;

    // Facts derived from server state only; the raw request body is never
    // passed through to the completion logic.
    const submissionData = {
      exerciseJustPassed,
      justCorrectQuestion:
        isQuizSubmission && isCorrectForThisAction && !alreadyCorrect
          ? questionIndex
          : undefined,
      attemptNumber: exercise?.firstAttemptPassed ? 1 : exercise?.attemptCount,
      usedHints: exercise?.usedHints,
      elapsedSeconds: exercise?.elapsedSeconds,
      wasOptimalSolution: exercise?.wasOptimal,
      linesOfCode: exercise?.passingCode?.split("\n").length,
    };

    const completionResult = await processLessonCompletion(
      user,
      lesson,
      submissionData,
    );

    const badgesUnlockedDetails =
      await gamification.evaluateAndApplyBadges(user);

    // Only a NEW completion counts toward the streak; resubmitting a finished
    // lesson must not satisfy the weekly requirement.
    if (completionResult.newlyCompleted) {
      await streakManager.trackCompletion(user);
    }
    await user.save();
    await gamification.checkLeaderboardBadges(user, User);

    const progressData = await buildProgressResponse(user, { Lesson, Module });

    return {
      message: "Success!",
      payload: {
        isCorrect: isCorrectForThisAction,
        feedback,
        completed: true,
        xpEarned: completionResult.xpIncrease,
        xpBreakdown: completionResult.xpBreakdown,
        newlyCompleted: completionResult.newlyCompleted,
        moduleCompleted: !!completionResult.autoCompletedModule,
        progress: progressData,
        badgesUnlocked: badgesUnlockedDetails,
        nextLessonId: completionResult.nextLessonId,
      },
    };
  }

  let partialXPEarned = 0;

  if (!existingLessonCompletion && isLessonXpEligible(moduleOrder)) {
    let entry = null;

    if (isExerciseSubmission && exerciseJustPassed) {
      entry = buildExerciseXpEntry(lessonId, exerciseProgress);
    } else if (isQuizSubmission && isCorrectForThisAction && !alreadyCorrect) {
      const attempts = quizHelpers.getQuestionAttempts(
        quizProgress,
        questionIndex,
      );
      entry = buildQuizAnswerXpEntry(lessonId, questionIndex, attempts);
    }

    if (entry && entry.amount > 0) {
      partialXPEarned = entry.amount;
      awardUserXp(user, entry.amount);
      await createXpTransactions(user._id, [entry]);
      await user.save();
    }
  }

  return {
    message: isCorrectForThisAction ? "Success!" : "Keep trying!",
    payload: {
      isCorrect: isCorrectForThisAction,
      feedback,
      completed: false,
      xpEarned: partialXPEarned,
    },
  };
};

/**
 * Processes a student's submission for a module-level quiz, validates scores against
 * the passing threshold, records the attempt, and handles completions, XP awards,
 * streaks, and leaderboard triggers if passed.
 *
 * @param {string} userId - The ID of the student submitting the quiz.
 * @param {string} moduleId - The ID of the module whose quiz is being attempted.
 * @param {Object} [answers={}] - A map of question IDs to the student's selected answers.
 * @returns {Promise<Object>} - An object containing success messages, score statistics,
 *                              earned XP, updated progress data, and unlocked badges.
 * @throws {AppError} 404 - If the module or module quiz is not found.
 * @throws {AppError} 403 - If the user attempts to take the quiz before completing all lessons.
 */
const submitModuleQuizAttempt = async (userId, moduleId, answers = {}) => {
  const module = await Module.findById(moduleId);
  if (!module) throw new AppError("Module not found.", 404);

  if (!hasModuleQuiz(module)) {
    throw new AppError("Module quiz not found.", 404);
  }

  const user = await findUserOrThrow(userId);

  const { completedLessons } = await fetchUserCompletionData(userId);

  const moduleLessons = await Lesson.find({
    moduleId: moduleId,
    isPublished: true,
  });

  const completedLessonsInModule = moduleProgress.getModuleLessonCompletion(
    moduleLessons,
    completedLessons,
  );

  if (completedLessonsInModule !== moduleLessons.length) {
    throw new AppError(
      "Complete all lessons before taking the module quiz",
      403,
    );
  }

  const questions = module.moduleQuiz.questions;
  let correctCount = 0;
  const results = [];

  questions.forEach((question) => {
    const userAnswer = answers[question._id.toString()];
    const isCorrect = userAnswer === question.correctAnswer;
    if (isCorrect) correctCount++;

    results.push({
      questionId: question._id,
      question: question.question,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation,
    });
  });

  const totalQuestions = questions.length;
  const score = Math.round((correctCount / totalQuestions) * 100);
  const passingScore = module.moduleQuiz.settings?.passingScore || 70;
  const passed = score >= passingScore;

  await QuizAttempt.create({
    userId,
    moduleId: module._id,
    attemptedAt: new Date(),
    score,
    passed,
    answers: results,
  });

  let xpIncrease = 0;
  let moduleCompletedNow = false;
  let nextModuleId = null;
  let badgesUnlockedDetails = [];
  let completionResult = null;

  if (passed) {
    completionResult = await processModuleCompletion(user, module, results);

    xpIncrease = completionResult.xpIncrease;
    moduleCompletedNow = completionResult.newlyCompleted;
    nextModuleId = completionResult.nextModuleId;

    badgesUnlockedDetails = await gamification.evaluateAndApplyBadges(user);

    // Retaking an already-passed module quiz must not count as a completion.
    if (completionResult.newlyCompleted) {
      await streakManager.trackCompletion(user);
    }
  }

  await user.save();

  if (passed) await gamification.checkLeaderboardBadges(user, User);

  const progressData = await buildProgressResponse(user, { Lesson, Module });

  return {
    message: passed ? "Quiz passed!" : "Quiz completed",
    payload: {
      passed,
      score,
      passingScore,
      correctAnswers: correctCount,
      totalQuestions,
      results,
      xpEarned: xpIncrease,
      xpBreakdown: completionResult?.xpBreakdown,
      moduleCompleted: moduleCompletedNow,
      progress: progressData,
      badgesUnlocked: badgesUnlockedDetails,
      nextModuleId,
    },
  };
};

/**
 * Scans all published modules for a user, verifies if all lessons and
 * the module quiz have been completed, and backfills missing module completion
 * records, XP transactions, completion counts and level.
 *
 * Authorization is NOT checked here: `userId` is the user being repaired, not
 * the caller, so the route must be protected by the adminOnly middleware.
 *
 * @param {string} userId - The ID of the user whose progress is being fixed.
 * @returns {Promise<string[]>} - An array of module titles that were fixed.
 */
const fixUserModuleProgress = async (userId) => {
  const user = await findUserOrThrow(userId);

  // Curriculum order, so repairs (and the returned titles) are deterministic.
  const modules = await Module.find({ isPublished: true }).sort("order").lean();
  const { completedLessons, completedModules } =
    await fetchUserCompletionData(userId);
  const quizAttempts = await QuizAttempt.find({ userId }).lean();

  // Fetch all lessons for all modules in one query
  const moduleIds = modules.map((m) => m._id);
  const lessonsByModule = await fetchLessonsByModule(moduleIds);

  let modulesFixed = [];
  let highestFixedOrder = 0;

  for (const module of modules) {
    const moduleIdString = module._id.toString();

    if (completedModules.includes(moduleIdString)) continue;

    const lessons = lessonsByModule[moduleIdString] || [];
    if (lessons.length === 0) continue;

    const allLessonsDone = analytics.isModuleFinished(
      completedLessons,
      lessons,
    );

    // M20 (Capstone) has no module quiz; all other modules require passing the quiz.
    const isFinalModuleWithoutQuiz =
      module.order === FINAL_MODULE_ORDER && !hasModuleQuiz(module);

    const quizPassed = isFinalModuleWithoutQuiz
      ? true
      : moduleProgress.hasPassedModuleQuiz({ quizAttempts }, module._id);

    if (allLessonsDone && quizPassed) {
      try {
        await ModuleCompletion.create({
          userId,
          moduleId: module._id,
          completedAt: new Date(),
        });

        // Same formula as a normal completion, minus per-answer quiz XP
        const { total, breakdown } = xpService.calculateModuleCompletionXP({
          order: module.order,
        });

        awardUserXp(user, total);
        await createXpTransactions(
          user._id,
          toXpLog(breakdown, {
            moduleId: module._id.toString(),
            reason: "admin_progress_fix",
          }),
        );

        user.completedModulesCount = (user.completedModulesCount || 0) + 1;
        highestFixedOrder = Math.max(highestFixedOrder, module.order);

        // Update user level incrementally or keep track
        if (module.order > 0) {
          user.level = Math.max(
            user.level || 1,
            Math.min(20, Math.max(1, highestFixedOrder)),
          );
        }

        // If repairing M20, ensure the course completion record and HoF eligibility are triggered
        if (module.order === FINAL_MODULE_ORDER) {
          await checkAndRecordCourseCompletion(user, userId, true);
        }

        // Save user state immediately per module to prevent partial-failure desyncs
        await user.save();

        modulesFixed.push(module.title);
      } catch (err) {
        if (err.code === 11000) {
          // Skip if already completed (duplicate key race condition)
          continue;
        }
        throw err;
      }
    }
  }

  return modulesFixed;
};

// +=============================================+
// |         USER PROGRESS & DASHBOARD           |
// +=============================================+
/**
 * Retrieves a comprehensive summary of a user's progress across the curriculum,
 * aggregating completed lessons and modules, calculating curriculum-wide completion stats,
 * and identifying the user's current active module data.
 *
 * @param {string} userId - The ID of the user whose progress summary is being retrieved.
 * @returns {Promise<Object|null>} - A summary object containing user data arrays, curriculum totals,
 *                                   current module info, and module order mappings, or null if not found.
 */
const getUserProgressSummary = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) return null;

  // Reusing fetchUserCompletionData helper
  const completionData = await fetchUserCompletionData(userId);
  const completedLessonIds = completionData.completedLessons;
  const completedModuleIds = completionData.completedModules;

  const modules = await Module.find({ isPublished: true })
    .select("_id order title")
    .sort("order")
    .lean();

  const moduleOrderMap = await levelUtils.getModuleOrderMap();

  let currentModuleData = null;
  const moduleIds = modules.map((m) => m._id);
  const allModuleLessons = await Lesson.find({
    moduleId: { $in: moduleIds },
    isPublished: true,
  })
    .select("_id moduleId")
    .lean();

  const lessonsByModule = {};
  allModuleLessons.forEach((l) => {
    const key = l.moduleId.toString();
    if (!lessonsByModule[key]) lessonsByModule[key] = [];
    lessonsByModule[key].push(l);
  });

  for (const module of modules) {
    if (module.order === 0) continue;
    if (completedModuleIds.includes(module._id.toString())) continue;

    const lessons = lessonsByModule[module._id.toString()] || [];
    const completedInModule = lessons.filter((l) =>
      completedLessonIds.includes(l._id.toString()),
    ).length;

    currentModuleData = {
      order: module.order,
      title: module.title,
      lessonCount: lessons.length,
      lessonsCompleted: completedInModule,
    };
    break;
  }

  if (!currentModuleData && completedModuleIds.length >= 20) {
    currentModuleData = null;
  }

  const userWithArrays = {
    ...user,
    completedLessons: completedLessonIds,
    completedModules: completedModuleIds,
    completedLessonsCount: completedLessonIds.length,
    completedModulesCount: completedModuleIds.length,
  };

  const { totalCurriculumLessons, completedCurriculumCount } =
    await getCurriculumProgressStats(userWithArrays, { Lesson, Module });

  return {
    userWithArrays,
    totalCurriculumLessons,
    completedCurriculumCount,
    currentModuleData,
    moduleOrderMap,
  };
};

// +=============================================+
// |      HALL OF FAME & COURSE COMPLETION       |
// +=============================================+
/**
 * Fetches a paginated list of inducted members for the Hall of Fame, filtering out
 * restricted age brackets and privacy settings while calculating ranks, timeline metrics,
 * and display names.
 *
 * @param {number} [page=1] - The page number for pagination.
 * @param {number} [limit=20] - The maximum number of members to return per page.
 * @returns {Promise<Object>} - An object containing formatted member rankings, total inducted count,
 *                              current page, and total pages.
 */
const getHallOfFameMembers = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [inductedMembers, totalInducted] = await Promise.all([
    CourseCompletion.find({ hofJoinedAt: { $ne: null } })
      .sort({ completedAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "userId",
        select: "username privacySettings createdAt ageBracket",
        match: { ageBracket: { $in: ["16-17", "18+"] } },
      })
      .lean(),
    CourseCompletion.countDocuments({ hofJoinedAt: { $ne: null } }),
  ]);

  const filteredMembers = inductedMembers.filter((member) => member.userId);

  const members = filteredMembers.map((member, index) => {
    const user = member.userId || {};
    return {
      rank: skip + index + 1,
      displayName: user.privacySettings?.showUsernameOnLeaderboards
        ? user.username
        : `Learner #${(user._id || member.userId).toString().slice(-6)}`,
      isAnonymous: !user.privacySettings?.showUsernameOnLeaderboards,
      completedAt: member.completedAt,
      timeToCompleteMs: member.timeToCompleteMs,
      timeToCompleteDays: Math.round(member.timeToCompleteMs / 86400000),
      inductedAt: member.hofJoinedAt,
      earlyOptIn: member.earlyOptIn,
    };
  });

  const totalPages = Math.ceil(totalInducted / limit);

  return {
    members,
    totalInducted,
    page,
    totalPages,
  };
};

/**
 * Opts an eligible user into the Hall of Fame, recording their induction timestamp,
 * assigning early opt-in badges, and updating their leaderboard status.
 *
 * @param {string} userId - The ID of the user opting into the Hall of Fame.
 * @returns {Promise<Object>} - An object containing the user's Hall of Fame rank and induction date.
 * @throws {AppError} 404 - If no course completion record exists for the user.
 * @throws {AppError} 400 - If the user is already opted into the Hall of Fame.
 */
const optInUserToHoF = async (userId) => {
  const completion = await CourseCompletion.findOne({ userId });
  if (!completion) {
    throw new AppError("No course completion record found.", 404);
  }

  if (completion.hofJoinedAt) {
    throw new AppError("You are already in the Hall of Fame.", 400);
  }

  const now = new Date();
  const inductedCount = await CourseCompletion.countDocuments({
    hofJoinedAt: { $ne: null },
  });

  completion.hofJoinedAt = now;
  completion.earlyOptIn = true;
  completion.earlyOptInAt = now;
  await completion.save();

  await User.findByIdAndUpdate(userId, {
    leaderboardStatus: "HOF",
    $addToSet: { badges: "hof" },
  });

  return {
    hofRank: inductedCount + 1,
    inductedAt: now,
  };
};

/**
 * Retrieves the course completion status, Hall of Fame eligibility schedule, induction data,
 * and completion time duration for a specific user.
 *
 * @param {string} userId - The ID of the user whose course status is being checked.
 * @returns {Promise<Object>} - An object detailing course completion state, completion dates,
 *                              HoF eligibility, rank, and completion duration in days.
 */
const getCourseStatusForUser = async (userId) => {
  const completion = await CourseCompletion.findOne({ userId }).lean();

  if (!completion) {
    return {
      courseCompleted: false,
      hofJoinedAt: null,
      hofEligibleAt: null,
      modulesCompleted: 0,
    };
  }

  let rank = null;
  if (completion.hofJoinedAt) {
    rank =
      (await CourseCompletion.countDocuments({
        hofJoinedAt: { $ne: null },
        completedAt: { $lt: completion.completedAt },
      })) + 1;
  }

  return {
    courseCompleted: true,
    completedAt: completion.completedAt,
    hofEligibleAt: completion.hofEligibleAt,
    hofJoinedAt: completion.hofJoinedAt || null,
    earlyOptIn: completion.earlyOptIn || false,
    rank,
    timeToCompleteDays: completion.timeToCompleteMs
      ? Math.round(completion.timeToCompleteMs / 86400000)
      : null,
  };
};

// ───────── EXPORTS ────────────

module.exports = {
  // Helpers
  validateCodeSubmission,
  fetchUserCompletionData,
  fetchLessonsByModule,
  getCurriculumProgressStats,
  // Orchestrators
  processLessonCompletion,
  processModuleCompletion,
  isLessonFullyCompleted,
  submitLessonAttempt,
  submitModuleQuizAttempt,
  fixUserModuleProgress,
  // User Progress
  getUserProgressSummary,
  // HoF
  getHallOfFameMembers,
  optInUserToHoF,
  getCourseStatusForUser,
};
