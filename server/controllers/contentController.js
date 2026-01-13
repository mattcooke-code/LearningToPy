// contentController.js
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const {
  validateCodeSubmission,
  createLessonCompletionRecord,
  updateUserStats,
} = require("../utils/contentHelpers");
const {
  streakLogic,
  formatProgressResponse,
  MODULE_XP_BONUS,
  calculateModuleLessonProgress,
} = require("../utils/progressHelpers");
const { evaluateBadges } = require("../utils/badgeLogic");
const { sendJsonResponse } = require("../utils/responseHelpers");
const { default: progress } = require("../../shared/constants/progress");

const getAllModules = catchAsync(async (req, res, next) => {
  const userId = req.userId;

  const modules = await Module.find({ isPublished: true })
    .populate("prerequisites", "title order")
    .sort("order")
    .lean();

  const user = await User.findById(userId).select(
    "completedLessons completedModules quizAttempts"
  );

  const modulesWithProgress = await Promise.all(
    modules.map(async (module) => {
      const lessons = await Lesson.find({
        moduleId: module._id,
        isPublished: true,
      });
      const completedLessonsInModule = lessons.filter((lesson) =>
        user.completedLessons.includes(lesson._id.toString())
      ).length;

      const moduleLessonProgress = calculateModuleLessonProgress(
        completedLessonsInModule,
        lessons.length
      );

      const isCompleted = user.completedModules.includes(module._id.toString());

      const quizCompleted = user.quizAttempts.some(
        (attempt) =>
          attempt.moduleId.toString() === module._id.toString() &&
          attempt.passed
      );

      const allLessonsComplete = completedLessonsInModule === lessons.length;

      console.log(
        `Module ${module.title}: ${completedLessonsInModule}/${lessons.length} lessons, Quiz: ${quizCompleted}, Completed: ${isCompleted}`
      );

      // Check if prerequisites are completed
      const isLocked =
        module.prerequisites &&
        module.prerequisites.length > 0 &&
        module.prerequisites.some((prereq) => {
          const prereqCompleted = user.completedModules.includes(
            prereq._id.toString()
          );
          console.log(`Prerequisite ${prereq.title}: ${prereqCompleted}`);
          return !prereqCompleted;
        });

      return {
        ...module,
        isCompleted,
        moduleLessonProgress,
        isLocked: !!isLocked,
        lessonCount: lessons.length,
        allLessonsComplete,
        quizCompleted,
      };
    })
  );

  sendJsonResponse(
    res,
    200,
    "Modules fetched successfully",
    modulesWithProgress
  );
});

const getModule = catchAsync(async (req, res, next) => {
  const { moduleId } = req.params;
  const userId = req.userId;

  const module = await Module.findById(moduleId).lean();

  if (!module) {
    return next(new AppError("Module not found.", 404));
  }

  const user = await User.findById(userId).select(
    "completedLessons completedModules quizAttempts"
  );

  const lessons = await Lesson.find({ moduleId: moduleId, isPublished: true });

  const completedLessonsInModule = lessons.filter((lesson) =>
    user.completedLessons.includes(lesson._id.toString())
  ).length;

  const allLessonsComplete = completedLessonsInModule === lessons.length;
  const isModuleComplete = user.completedModules.includes(moduleId.toString());

  const moduleQuizAttempts = user.quizAttempts.filter(
    (attempt) => attempt.moduleId.toString() === moduleId.toString()
  );

  const bestAttempt =
    moduleQuizAttempts.length > 0
      ? moduleQuizAttempts.reduce((best, current) =>
          current.score > best.score ? current : best
        )
      : null;

  const quizCompleted = moduleQuizAttempts.some((attempt) => attempt.passed);

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

  const user = await User.findById(userId).select("completedLessons");

  const lessonsWithProgress = lessons.map((lesson) => ({
    ...lesson,
    isCompleted: user.completedLessons.includes(lesson._id.toString()),
    isLocked: false,
  }));

  sendJsonResponse(res, 200, "Lessons fetched successfully", {
    module: {
      title: module.title,
      description: module.description,
      icon: module.icon,
    },
    lessons: lessonsWithProgress,
  });
});

const getLessonContent = catchAsync(async (req, res, next) => {
  const { lessonId } = req.params;
  const userId = req.userId;

  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  const user = await User.findById(userId).select("completedLessons");
  const isCompleted = user.completedLessons.includes(lessonId);

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
    isCompleted,
  });
});

const submitLesson = catchAsync(async (req, res, next) => {
  const { lessonId } = req.params;
  const userId = req.userId;
  const { answer, code, questionIndex = 0 } = req.body;

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  let isCorrect = false;
  let feedback = "";

  // 1. Handle Coding Exercise
  if (lesson.exercise && code) {
    const validationResult = validateCodeSubmission(code, lesson.exercise);
    isCorrect = validationResult.isCorrect;
    feedback = validationResult.feedback;
  }
  // 2. Handle Quiz
  else if (
    lesson.quiz &&
    Array.isArray(lesson.quiz) &&
    lesson.quiz.length > 0
  ) {
    const currentQuestion = lesson.quiz[questionIndex];

    if (answer !== undefined) {
      isCorrect = answer === currentQuestion.correctAnswer;
      feedback = isCorrect
        ? "Correct! " + (currentQuestion.explanation || "")
        : "Try again!";
    }
  }
  // 3. Handle Theory (Auto-pass)
  else if (lesson.contentType === "theory") {
    isCorrect = true;
    feedback = "Lesson completed!";
  }

  let moduleCompletedNow = false;
  let xpIncrease = 0;
  let badgesUnlockedDetails = [];
  let nextLessonId = null;

  // Only proceed with progress updates if correct or theory
  if (isCorrect) {
    const user = await User.findById(userId);

    if (!user.completedLessons.includes(lessonId)) {
      user.completedLessons.push(lessonId);
      xpIncrease = lesson.xpReward || 0;
      const completionTimestamp = new Date();

      // Next Lesson Logic
      if (lesson.nextLessonId) {
        nextLessonId = lesson.nextLessonId;
      } else {
        const nextLesson = await Lesson.findOne({
          moduleId: lesson.moduleId,
          order: lesson.order + 1,
          isPublished: true,
        });
        if (nextLesson) nextLessonId = nextLesson._id;
      }

      user.xp += xpIncrease;
      user.lastActiveDate = new Date();

      // Tracking & Stats
      const lessonRecord = createLessonCompletionRecord(
        lesson,
        req.body,
        completionTimestamp
      );
      user.lessonCompletionHistory.push(lessonRecord);
      updateUserStats(user, lessonRecord, req.body);

      // Badge Evaluation
      const { newlyUnlocked, unlockedDetails } = await evaluateBadges({
        user,
        context: {
          type: "lesson_completion",
          lessonId,
          moduleCompleted: moduleCompletedNow,
        },
      });

      if (newlyUnlocked?.length > 0) {
        newlyUnlocked.forEach((id) => {
          if (!user.badges.includes(id)) user.badges.push(id);
        });
        badgesUnlockedDetails = unlockedDetails;
      }

      await user.save();
    }

    const progressData = formatProgressResponse(user.toObject());

    return sendJsonResponse(res, 200, "Success!", {
      isCorrect,
      feedback,
      completed: true,
      xpEarned: xpIncrease,
      progress: progressData,
      moduleCompleted: moduleCompletedNow,
      badgesUnlocked: badgesUnlockedDetails,
      nextLessonId,
    });
  }

  // Fallback for incorrect answers
  sendJsonResponse(res, 200, "Keep trying!", {
    isCorrect: false,
    feedback,
    completed: false,
    xpEarned: 0,
  });
});

const submitModuleQuiz = catchAsync(async (req, res, next) => {
  const { moduleId } = req.params;
  const userId = req.userId;
  const { answers } = req.body;

  const module = await Module.findById(moduleId);
  if (!module) {
    return next(new AppError("Module not found.", 404));
  }

  if (
    !module.moduleQuiz ||
    !module.moduleQuiz.questions ||
    module.moduleQuiz.questions.length === 0
  ) {
    return next(new AppError("Module quiz not found.", 404));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  const moduleLessons = await Lesson.find({
    moduleId: moduleId,
    isPublished: true,
  });

  const completedLessonsInModule = moduleLessons.filter((lesson) =>
    user.completedLessons.includes(lesson._id.toString())
  ).length;

  if (completedLessonsInModule !== moduleLessons.length) {
    return next(
      new AppError("Complete all lessons before taking the module quiz", 403)
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

  const quizAttempt = {
    attemptedAt: new Date(),
    score,
    passed,
    answers: results,
  };

  if (!user.quizAttempts) {
    user.quizAttempts = [];
  }

  user.quizAttempts.push({ moduleId: moduleId, ...quizAttempt });

  let xpIncrease = 0;
  let moduleCompletedNow = false;
  let badgesUnlockedDetails = [];
  let nextModuleId = null;

  if (passed) {
    const moduleIdString = moduleId.toString();

    if (!user.completedModules.includes(moduleIdString)) {
      user.completedModules.push(moduleIdString);
      xpIncrease = module.xpReward || 100;
      moduleCompletedNow = true;

      if (!Array.isArray(user.moduleCompletionHistory)) {
        user.moduleCompletionHistory = [];
      }

      user.moduleCompletionHistory.push({
        moduleId: moduleId,
        completedAt: new Date(),
      });

      user.xp += xpIncrease;
      user.lastActiveDate = new Date();

      const { newlyUnlocked, unlockedDetails } = await evaluateBadges({
        user,
        context: { type: "module_completion", moduleId, quizScore: score },
      });

      if (newlyUnlocked?.length > 0) {
        newlyUnlocked.forEach((id) => {
          if (!user.badges.includes(id)) user.badges.push(id);
        });
        badgesUnlockedDetails = unlockedDetails;
      }

      const nextModule = await Module.findOne({
        order: module.order + 1,
        isPublished: true,
      });

      if (nextModule) {
        nextModuleId = nextModule._id;
      }
    }
  }

  await user.save();

  const progressData = formatProgressResponse(user.toObject());

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
      moduleCompleted: moduleCompletedNow,
      progress: progressData,
      badgesUnlocked: badgesUnlockedDetails,
      nextModuleId,
    }
  );
});

const fixModuleProgress = catchAsync(async (req, res, next) => {
  const userId = req.userId;

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  if (!user.isAdmin) {
    return next(new AppError("Access denied. Admin privileges required.", 403));
  }

  const modules = await Module.find({ isPublished: true }).lean();
  let modulesFixed = [];

  for (const module of modules) {
    const moduleIdString = module._id.toString();

    if (user.completedModules.includes(moduleIdString)) continue;

    const lessons = await Lesson.find({
      moduleId: module._id,
      isPublished: true,
    });
    if (lessons.length === 0) continue;

    const allLessonsDone = lessons.every((l) =>
      user.completedLessons.includes(l._id.toString())
    );

    const hasPassedQuiz = user.quizAttempts?.some(
      (attempt) =>
        attempt.moduleId.toString() === moduleIdString &&
        attempt.passed === true
    );

    if (allLessonsDone && hasPassedQuiz) {
      user.completedModules.push(moduleIdString);
      user.xp += module.xpReward || 100;

      user.moduleCompletionHistory.push({
        moduleId: module._id,
        completedAt: new Date(),
      });

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
