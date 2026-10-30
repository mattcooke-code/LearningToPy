// contentController.js
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const User = require("../models/User");
const LessonCompletion = require("../models/LessonCompletion");
const ModuleCompletion = require("../models/ModuleCompletion");
const QuizAttempt = require("../models/QuizAttempt");
const LessonQuizProgress = require("../models/LessonQuizProgress");
const ExerciseProgress = require("../models/ExerciseProgress");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const learningEngine = require("../services/learningEngine");
const quizHelpers = require("../utils/quizHelpers");
const moduleProgress = require("../services/moduleProgress");
const analytics = require("../services/analytics");

const { sendJsonResponse } = require("../utils/responseHelpers");

// ─── HELPERS ──────────────────────────────────────────────────

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
    learningEngine.fetchUserCompletionData(userId),
  ]);

  const { completedLessons, completedModules, quizAttempts } = completionData;

  // Single query for all lessons across all modules
  const moduleIds = modules.map((m) => m._id);
  const lessonsByModule = await fetchLessonsByModule(moduleIds);

  const modulesWithProgress = modules.map((module) => {
    const lessons = lessonsByModule[module._id.toString()] || [];
    const completedLessonsInModule = moduleProgress.getModuleLessonCompletion(
      lessons,
      completedLessons,
    );
    const moduleLessonProgress = analytics.calculateProgress(
      completedLessonsInModule,
      lessons.length,
    );
    const isCompleted = completedModules.includes(module._id.toString());
    const quizCompleted = moduleProgress.hasPassedModuleQuiz(
      { quizAttempts },
      module._id,
    );
    const allLessonsComplete = analytics.isModuleFinished(
      completedLessons,
      lessons,
    );
    const { isLocked } = moduleProgress.checkPrerequisites(
      module,
      completedModules,
    );

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
    await learningEngine.fetchUserCompletionData(userId);

  const lessons = await Lesson.find({ moduleId, isPublished: true });

  const completedLessonsInModule = moduleProgress.getModuleLessonCompletion(
    lessons,
    completedLessons,
  );
  const allLessonsComplete = analytics.isModuleFinished(
    completedLessons,
    lessons,
  );
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

  const quizCompleted = moduleProgress.hasPassedModuleQuiz(
    { quizAttempts },
    moduleId,
  );

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
          const correctAnswers =
            quizHelpers.getCorrectAnswerIndices(quizProgress);
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
 * Submit a lesson attempt — delegates entirely to the learning engine.
 *
 * @route   POST /api/content/lessons/:lessonId/submit
 */
const submitLesson = catchAsync(async (req, res, next) => {
  const { lessonId } = req.params;
  const userId = req.userId;

  const result = await learningEngine.submitLessonAttempt(
    userId,
    lessonId,
    req.body,
  );

  return sendJsonResponse(res, 200, result.message, result.payload);
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

  const result = await learningEngine.submitModuleQuizAttempt(
    userId,
    moduleId,
    answers,
  );

  return sendJsonResponse(res, 200, result.message, result.payload);
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
    await learningEngine.fetchUserCompletionData(userId);
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

    const allLessonsDone = analytics.isModuleFinished(
      completedLessons,
      lessons,
    );
    const quizPassed = moduleProgress.hasPassedModuleQuiz(
      { quizAttempts },
      module._id,
    );

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
