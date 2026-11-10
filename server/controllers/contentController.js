// contentController.js
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const LessonCompletion = require("../models/LessonCompletion");
const LessonQuizProgress = require("../models/LessonQuizProgress");
const ExerciseProgress = require("../models/ExerciseProgress");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const learningEngine = require("../services/learningEngine");
const quizHelpers = require("../utils/quizHelpers");
const moduleProgress = require("../services/moduleProgress");
const analytics = require("../services/analytics");

const { sendJsonResponse } = require("../utils/responseHelpers");

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
  const lessonsByModule = await learningEngine.fetchLessonsByModule(moduleIds);

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

  const [completionData, lessonsByModule] = await Promise.all([
    learningEngine.fetchUserCompletionData(userId),
    learningEngine.fetchLessonsByModule([moduleId]),
  ]);

  const { completedLessons, completedModules, quizAttempts } = completionData;

  const lessons = lessonsByModule[moduleId.toString()] || [];

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
  const data = req.body;

  const userLocalDate = data.userLocalDate;

  const questionIndex = Number(data.questionIndex ?? 0);
  if (!Number.isInteger(questionIndex) || questionIndex < 0) {
    return next(new AppError("Invalid question index", 400));
  }

  let parsedAnswer = undefined;
  if (data.answer !== undefined && data.answer !== null && data.answer !== "") {
    const num = Number(data.answer);
    if (!Number.isInteger(num)) {
      return next(new AppError("Invalid answer", 400));
    }
    parsedAnswer = num;
  }

  const clean = {
    answer: parsedAnswer,
    code: typeof data.code === "string" ? data.code.slice(0, 20000) : undefined,
    questionIndex,
    isCorrect: data.isCorrect === true,
    usedHints: data.usedHints === true,
    wasOptimalSolution: data.wasOptimalSolution === true,
    elapsedSeconds: Number.isFinite(data.elapsedSeconds)
      ? Math.min(Math.max(data.elapsedSeconds, 0), 86400)
      : undefined,
    validationResult: {
      feedback: String(data.validationResult?.feedback ?? "").slice(0, 500),
    },
  };

  const result = await learningEngine.submitLessonAttempt(
    userId,
    lessonId,
    clean,
    userLocalDate,
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
  const { answers, userLocalDate } = req.body;

  const result = await learningEngine.submitModuleQuizAttempt(
    userId,
    moduleId,
    answers,
    userLocalDate,
  );

  return sendJsonResponse(res, 200, result.message, result.payload);
});

module.exports = {
  getAllModules,
  getModule,
  getModuleLessons,
  getLessonContent,
  submitLesson,
  submitModuleQuiz,
};
