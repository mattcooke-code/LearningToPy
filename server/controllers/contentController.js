// contentController.js
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const User = require("../models/User");
const LessonCompletion = require("../models/LessonCompletion");
const ModuleCompletion = require("../models/ModuleCompletion");
const QuizAttempt = require("../models/QuizAttempt");
const LessonQuizProgress = require("../models/LessonQuizProgress");
const ExerciseProgress = require("../models/ExerciseProgress");
const XpTransaction = require("../models/XpTransaction");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const {
  validateCodeSubmission,
  processLessonCompletion,
  isLessonFullyCompleted,
  getCurriculumProgressStats,
  processModuleCompletion,
} = require("../services/learningEngine");

const {
  hasQuiz,
  hasExercise,
  getOrCreateQuizProgress,
  updateQuizProgress,
  getQuestionAttempts,
  calculateQuizAnswerXP,
  getCorrectAnswerIndices,
} = require("../utils/quizHelpers");

const {
  checkPrerequisites,
  hasPassedModuleQuiz,
  getModuleLessonCompletion,
} = require("../services/moduleProgress");

const {
  calculateProgress,
  isModuleFinished,
  formatProgressResponse,
} = require("../services/analytics");

const {
  evaluateBadges,
  checkLeaderboardBadges,
} = require("../services/gamification");

const { sendJsonResponse } = require("../utils/responseHelpers");
const { trackCompletion } = require("../services/streakManager");
const {
  getOrCreateExerciseProgress,
  recordExerciseAttempt,
} = require("../utils/exerciseHelpers");

// ─── HELPERS ──────────────────────────────────────────────────

/**
 * Fetch all completion data for a user from the new collections.
 *
 * @param {string} userId
 * @param {Object} [options]
 * @param {boolean} [options.fullDocs=false] - If true, return full documents
 *   for lessonCompletions and moduleCompletions instead of just IDs.
 * @returns {Promise<Object>} { completedLessons, completedModules, quizAttempts,
 *   lessonCompletions?, moduleCompletions? }
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

// ─── CONTROLLER FUNCTIONS ────────────────────────────────────

/**
 * Fetch all published modules with user progress metadata.
 *
 * Uses a single lesson query (O(1) round-trips) instead of one per module.
 *
 * @route   GET /api/content/modules
 * @returns {Object} 200 - Array of modules with progress fields
 */
const getAllModules = catchAsync(async (req, res, next) => {
  const userId = req.userId;

  const [modules, completionData] = await Promise.all([
    Module.find({ isPublished: true })
      .populate("prerequisites", "title order")
      .sort("order")
      .lean(),
    fetchUserCompletionData(userId),
  ]);

  const { completedLessons, completedModules, quizAttempts } = completionData;

  // Single query for all lessons across all modules
  const moduleIds = modules.map((m) => m._id);
  const lessonsByModule = await fetchLessonsByModule(moduleIds);

  const modulesWithProgress = modules.map((module) => {
    const lessons = lessonsByModule[module._id.toString()] || [];
    const completedLessonsInModule = getModuleLessonCompletion(
      lessons,
      completedLessons,
    );
    const moduleLessonProgress = calculateProgress(
      completedLessonsInModule,
      lessons.length,
    );
    const isCompleted = completedModules.includes(module._id.toString());
    const quizCompleted = hasPassedModuleQuiz({ quizAttempts }, module._id);
    const allLessonsComplete = isModuleFinished(completedLessons, lessons);
    const { isLocked } = checkPrerequisites(module, completedModules);

    return {
      ...module,
      isCompleted,
      moduleLessonProgress,
      isLocked,
      lessonCount: lessons.length,
      allLessonsComplete,
      quizCompleted,
    };
  });

  sendJsonResponse(
    res,
    200,
    "Modules fetched successfully",
    modulesWithProgress,
  );
});

/**
 * Fetch a single module with detailed user progress.
 *
 * @route   GET /api/content/modules/:moduleId
 * @returns {Object} 200 - Module with progress details
 */
const getModule = catchAsync(async (req, res, next) => {
  const { moduleId } = req.params;
  const userId = req.userId;

  const module = await Module.findById(moduleId).lean();
  if (!module) {
    return next(new AppError("Module not found.", 404));
  }

  const { completedLessons, completedModules, quizAttempts } =
    await fetchUserCompletionData(userId);

  const lessons = await Lesson.find({ moduleId, isPublished: true });

  const completedLessonsInModule = getModuleLessonCompletion(
    lessons,
    completedLessons,
  );
  const allLessonsComplete = isModuleFinished(completedLessons, lessons);
  const isModuleComplete = completedModules.includes(moduleId.toString());

  const moduleQuizAttempts = quizAttempts.filter(
    (attempt) => attempt.moduleId.toString() === moduleId.toString(),
  );

  const bestAttempt =
    moduleQuizAttempts.length > 0
      ? moduleQuizAttempts.reduce((best, current) =>
          current.score > best.score ? current : best,
        )
      : null;

  const quizCompleted = hasPassedModuleQuiz({ quizAttempts }, moduleId);

  sendJsonResponse(res, 200, "Module fetched successfully.", {
    ...module,
    allLessonsComplete,
    quizCompleted,
    isModuleComplete,
    lessonCount: lessons.length,
    completedLessonCount: completedLessonsInModule,
    quizAttempts: moduleQuizAttempts.length,
    bestQuizScore: bestAttempt?.score || null,
  });
});

/**
 * Fetch all published lessons for a module with completion status.
 *
 * Only queries completions for this module's lessons, not the user's
 * entire history.
 *
 * @route   GET /api/content/modules/:moduleId/lessons
 * @returns {Object} 200 - Module header + lessons array with progress
 */
const getModuleLessons = catchAsync(async (req, res, next) => {
  const { moduleId } = req.params;
  const userId = req.userId;

  const module = await Module.findById(moduleId);
  if (!module) {
    return next(new AppError("Module not found", 404));
  }

  const lessons = await Lesson.find({ moduleId, isPublished: true })
    .sort("order")
    .select("-exercise.solution -quiz.correctAnswer")
    .lean();

  // Only check completions for this module's lessons
  const lessonIds = lessons.map((l) => l._id);
  const lessonCompletions = await LessonCompletion.find({
    userId,
    lessonId: { $in: lessonIds },
  })
    .select("lessonId")
    .lean();

  const completedLessonIds = new Set(
    lessonCompletions.map((lc) => lc.lessonId.toString()),
  );

  const getModuleNumber = (order) => `M${order}`;

  const lessonsWithProgress = lessons.map((lesson) => ({
    ...lesson,
    isCompleted: completedLessonIds.has(lesson._id.toString()),
    isLocked: false,
    moduleNumber: getModuleNumber(module.order),
  }));

  sendJsonResponse(res, 200, "Lessons fetched successfully", {
    module: {
      title: module.title,
      description: module.description,
      icon: module.icon,
      order: module.order,
      moduleNumber: getModuleNumber(module.order),
    },
    lessons: lessonsWithProgress,
  });
});

/**
 * Fetch full lesson content, conditionally including answers.
 *
 * Lesson completion and quiz progress queries run in parallel.
 *
 * @route   GET /api/content/lessons/:lessonId
 * @returns {Object} 200 - Lesson content with quiz/exercise progress
 */
const getLessonContent = catchAsync(async (req, res, next) => {
  const { lessonId } = req.params;
  const userId = req.userId;

  const lesson = await Lesson.findById(lessonId)
    .populate("moduleId", "order title")
    .lean();

  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  // Parallel queries
  const [lessonCompletion, quizProgress, exerciseProgress] = await Promise.all([
    LessonCompletion.findOne({ userId, lessonId }),
    LessonQuizProgress.findOne({ userId, lessonId }).lean(),
    ExerciseProgress.findOne({ userId, lessonId }).lean(),
  ]);

  const isCompleted = !!lessonCompletion;

  // Omit answers ONLY if the user hasn't finished the lesson yet
  if (!isCompleted) {
    if (lesson.exercise) delete lesson.exercise.solution;
    if (lesson.quiz && Array.isArray(lesson.quiz)) {
      lesson.quiz = lesson.quiz.map((q) => {
        const { correctAnswer, ...safeQuestion } = q;
        return safeQuestion;
      });
    }
  }

  sendJsonResponse(res, 200, "Lesson content fetched successfully", {
    ...lesson,
    moduleId: lesson.moduleId._id.toString(),
    moduleNumber: `M${lesson.moduleId.order}`,
    isCompleted,
    quizProgress: quizProgress
      ? (() => {
          const correctAnswers = getCorrectAnswerIndices(quizProgress);
          return {
            correctAnswers,
            completed: quizProgress.completed,
            progress: correctAnswers.length,
            totalQuestions: lesson.quiz?.length || 0,
          };
        })()
      : null,
    exerciseProgress: exerciseProgress
      ? {
          passed: exerciseProgress.passed,
          passedAt: exerciseProgress.passedAt,
          attemptCount: exerciseProgress.attemptCount,
        }
      : null,
  });
});

/**
 * Submit a lesson attempt — handles exercises, quizzes, and theory lessons.
 *
 * @route   POST /api/content/lessons/:lessonId/submit
 */
const submitLesson = catchAsync(async (req, res, next) => {
  const { lessonId } = req.params;
  const userId = req.userId;
  const {
    answer,
    code,
    questionIndex = 0,
    validationResult,
    isCorrect = false,
    usedHints = false,
    elapsedSeconds,
    wasOptimalSolution,
    moduleConfigReward,
  } = req.body;

  // ── 1. Load lesson and user ────────────────────────
  const lesson = await Lesson.findById(lessonId).populate(
    "moduleId",
    "order phase",
  );
  if (!lesson) return next(new AppError("Lesson not found", 404));

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  // ── 2. Load both progress records ──────────────────
  const exerciseProgress = await getOrCreateExerciseProgress(
    userId,
    lessonId,
    lesson,
  );
  const quizProgress = await getOrCreateQuizProgress(userId, lessonId, lesson);

  // ── 3. Determine what this request is ─────────────
  const isExerciseSubmission = hasExercise(lesson) && code !== undefined;
  const isQuizSubmission = hasQuiz(lesson) && answer !== undefined;

  const isStatusCheckSubmission = !isExerciseSubmission && !isQuizSubmission;
  const lessonCompletesByStatusCheck = !hasExercise(lesson) && !hasQuiz(lesson);

  const isTheoryStatusCheck =
    isStatusCheckSubmission && lessonCompletesByStatusCheck;

  let feedback = validationResult?.feedback || "Great job!";
  let isCorrectForThisAction = false;

  // ── 4. Handle exercise submission ─────────────────
  if (isExerciseSubmission) {
    if (!code || code.trim() === "") {
      return next(new AppError("No code submitted", 400));
    }

    // Trusted from client. Shape tested (not empty, not starter code)
    const serverValidation = validateCodeSubmission(code, lesson.exercise);
    if (!serverValidation.isCorrect) {
      return sendJsonResponse(res, 200, serverValidation.feedback, {
        isCorrect: false,
        feedback: serverValidation.feedback,
        completed: false,
        xpEarned: 0,
      });
    }

    isCorrectForThisAction = isCorrect;

    await recordExerciseAttempt(exerciseProgress, {
      passed: isCorrect,
      code,
      usedHints,
      wasOptimal: wasOptimalSolution,
      elapsedSeconds,
    });

    feedback = validationResult?.feedback || "Code submitted successfully";
  }

  // ── 5. Handle quiz submission ─────────────────────
  else if (isQuizSubmission) {
    const currentQuestion = lesson.quiz[questionIndex];
    if (!currentQuestion) {
      return next(new AppError("Invalid question index", 400));
    }

    isCorrectForThisAction = answer === currentQuestion.correctAnswer;

    if (isCorrectForThisAction) {
      feedback = `Correct! ${currentQuestion.explanation || ""}`;
      await updateQuizProgress(quizProgress, questionIndex, true, lesson);
    } else {
      feedback = `Try again! ${currentQuestion.explanation || ""}`;
      await updateQuizProgress(quizProgress, questionIndex, false, lesson);
    }
  }

  // ── 6. Handle theory / status check ───────────────
  else if (isTheoryStatusCheck) {
    feedback = "Status checked/Theory completed!";
  }

  // ── 7. Re-read persisted exercise state ───────────
  const exercisePassed = exerciseProgress?.passed || false;

  // ── 8. Evaluate completion from persisted state ───
  const completed = isLessonFullyCompleted(
    lesson,
    quizProgress,
    exercisePassed,
    isStatusCheckSubmission && lessonCompletesByStatusCheck,
  );

  // ── 9a. Full completion path ──────────────────────
  if (completed) {
    const freshQuizProgress = await LessonQuizProgress.findOne({
      userId,
      lessonId,
    });

    const submissionData = {
      ...req.body,
      moduleConfigReward,
      quizProgress: freshQuizProgress,
    };

    const completionResult = await processLessonCompletion(
      user,
      lesson,
      submissionData,
    );

    const { newlyUnlocked, unlockedDetails } = await evaluateBadges(user, {
      type: "lesson_completion",
      lessonId,
    });

    if (newlyUnlocked?.length > 0) {
      newlyUnlocked.forEach((id) => {
        if (!user.badges.includes(id)) user.badges.push(id);
      });
    }

    await trackCompletion(user);
    await user.save();
    await checkLeaderboardBadges(user, User);

    // Fetch progress data — fullDocs: true avoids duplicate queries
    const [
      { totalCurriculumLessons, completedCurriculumCount },
      completionData,
    ] = await Promise.all([
      getCurriculumProgressStats(user, { Lesson, Module }),
      fetchUserCompletionData(userId, { fullDocs: true }),
    ]);

    const progressData = formatProgressResponse(
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

    return sendJsonResponse(res, 200, "Success!", {
      isCorrect: isCorrectForThisAction,
      feedback,
      completed: true,
      xpEarned: completionResult.xpIncrease,
      xpBreakdown: completionResult.xpBreakdown,
      progress: progressData,
      badgesUnlocked: unlockedDetails,
      nextLessonId: completionResult.nextLessonId,
    });
  }

  // ── 9b. Partial success path ──────────────────────
  let partialXPEarned = 0;

  // XP awarded only on full completion
  if (isExerciseSubmission && isCorrectForThisAction) {
    partialXPEarned = 0;
  } else if (isQuizSubmission && isCorrectForThisAction) {
    const attempts = getQuestionAttempts(quizProgress, questionIndex);
    partialXPEarned = calculateQuizAnswerXP(attempts);

    if (partialXPEarned > 0) {
      user.xp = (user.xp || 0) + partialXPEarned;
      await XpTransaction.create({
        userId: user._id,
        amount: partialXPEarned,
        source: "LESSON_QUIZ",
        meta: { lessonId, questionIndex, attempts },
        awardedAt: new Date(),
      });
      await user.save();
    }
  }

  return sendJsonResponse(
    res,
    200,
    isCorrectForThisAction ? "Success!" : "Keep trying!",
    {
      isCorrect: isCorrectForThisAction,
      feedback,
      completed: false,
      xpEarned: partialXPEarned,
    },
  );
});

/**
 * Submit a module quiz after all lessons are completed.
 *
 * @route   POST /api/content/modules/:moduleId/quiz
 */
const submitModuleQuiz = catchAsync(async (req, res, next) => {
  const { moduleId } = req.params;
  const userId = req.userId;
  const { answers } = req.body;

  const module = await Module.findById(moduleId);
  if (!module) return next(new AppError("Module not found.", 404));

  if (!module.moduleQuiz?.questions?.length) {
    return next(new AppError("Module quiz not found.", 404));
  }

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found.", 404));

  const { completedLessons } = await fetchUserCompletionData(userId);

  const moduleLessons = await Lesson.find({
    moduleId: moduleId,
    isPublished: true,
  });

  const completedLessonsInModule = getModuleLessonCompletion(
    moduleLessons,
    completedLessons,
  );

  if (completedLessonsInModule !== moduleLessons.length) {
    return next(
      new AppError("Complete all lessons before taking the module quiz", 403),
    );
  }

  // Grade the quiz
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
    completionResult = await processModuleCompletion(
      user,
      module,
      score,
      results,
    );

    xpIncrease = completionResult.xpIncrease;
    moduleCompletedNow = completionResult.newlyCompleted;
    nextModuleId = completionResult.nextModuleId;

    const { newlyUnlocked, unlockedDetails } = await evaluateBadges(user, {
      type: "module_completion",
      moduleId: module._id,
      quizScore: score,
    });

    badgesUnlockedDetails = unlockedDetails || [];
    if (newlyUnlocked?.length > 0) {
      newlyUnlocked.forEach((id) => {
        if (!user.badges.includes(id)) user.badges.push(id);
      });
    }

    await trackCompletion(user);
  }

  await user.save();

  if (passed) await checkLeaderboardBadges(user, User);

  // Fetch progress data in parallel
  const [{ totalCurriculumLessons, completedCurriculumCount }, completionData] =
    await Promise.all([
      getCurriculumProgressStats(user, { Lesson, Module }),
      fetchUserCompletionData(userId, { fullDocs: true }),
    ]);

  const progressData = formatProgressResponse(
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

  return sendJsonResponse(
    res,
    200,
    passed ? "Quiz passed!" : "Quiz completed",
    {
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
  );
});

/**
 * Fix module completion state for admin users.
 * Uses a single lesson query + client-side grouping.
 *
 * @route   POST /api/content/modules/fix-progress
 */
const fixModuleProgress = catchAsync(async (req, res, next) => {
  const userId = req.userId;

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  if (!user.isAdmin) {
    return next(new AppError("Access denied. Admin privileges required.", 403));
  }

  const modules = await Module.find({ isPublished: true }).lean();
  const { completedLessons, completedModules } =
    await fetchUserCompletionData(userId);
  const quizAttempts = await QuizAttempt.find({ userId }).lean();

  // Fetch all lessons for all modules in one query
  const moduleIds = modules.map((m) => m._id);
  const lessonsByModule = await fetchLessonsByModule(moduleIds);

  let modulesFixed = [];

  for (const module of modules) {
    const moduleIdString = module._id.toString();

    if (completedModules.includes(moduleIdString)) continue;

    const lessons = lessonsByModule[moduleIdString] || [];
    if (lessons.length === 0) continue;

    const allLessonsDone = isModuleFinished(completedLessons, lessons);
    const quizPassed = hasPassedModuleQuiz({ quizAttempts }, module._id);

    if (allLessonsDone && quizPassed) {
      await ModuleCompletion.create({
        userId,
        moduleId: module._id,
        completedAt: new Date(),
      });

      user.xp += module.xpReward || 100;
      user.completedModulesCount = (user.completedModulesCount || 0) + 1;

      modulesFixed.push(module.title);
    }
  }

  if (modulesFixed.length > 0) await user.save();

  sendJsonResponse(res, 200, "Module integrity check complete", {
    fixedCount: modulesFixed.length,
    modules: modulesFixed,
  });
});

module.exports = {
  getAllModules,
  getModule,
  getModuleLessons,
  getLessonContent,
  submitLesson,
  submitModuleQuiz,
  fixModuleProgress,
};
