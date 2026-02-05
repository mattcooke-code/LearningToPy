// contentController.js
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const {
  // Import from new utility files
  validateCodeSubmission,
  processLessonCompletion,
  isLessonFullyCompleted,
  getCurriculumProgressStats,
} = require("../utils/learningEngine");

const {
  hasQuiz,
  hasExercise,
  getOrCreateQuizProgress,
  updateQuizProgress,
} = require("../utils/quizHelpers");

const {
  checkPrerequisites,
  hasPassedModuleQuiz,
  getModuleLessonCompletion,
} = require("../utils/moduleProgress");

const {
  // Import navigation functions
  findNextLesson,
  findNextModule,
} = require("../utils/navigation");

const {
  // Import analytics functions
  calculateProgress,
  isModuleFinished,
  formatProgressResponse,
} = require("../utils/analytics");

const {
  // Import gamification functions
  evaluateBadges,
} = require("../utils/gamification");

const { sendJsonResponse } = require("../utils/responseHelpers");

// ====== CONTROLLER FUNCTIONS ======

const getAllModules = catchAsync(async (req, res, next) => {
  const userId = req.userId;

  const modules = await Module.find({ isPublished: true })
    .populate("prerequisites", "title order")
    .sort("order")
    .lean();

  const user = await User.findById(userId).select(
    "completedLessons completedModules quizAttempts",
  );

  const modulesWithProgress = await Promise.all(
    modules.map(async (module) => {
      const lessons = await Lesson.find({
        moduleId: module._id,
        isPublished: true,
      });

      const completedLessonsInModule = getModuleLessonCompletion(
        lessons,
        user.completedLessons,
      );

      const moduleLessonProgress = calculateProgress(
        completedLessonsInModule,
        lessons.length,
      );

      const isCompleted = user.completedModules.includes(module._id.toString());
      const quizCompleted = hasPassedModuleQuiz(user, module._id);
      const allLessonsComplete = isModuleFinished(
        user.completedLessons,
        lessons,
      );

      const { isLocked } = checkPrerequisites(module, user.completedModules);

      return {
        ...module,
        isCompleted,
        moduleLessonProgress,
        isLocked,
        lessonCount: lessons.length,
        allLessonsComplete,
        quizCompleted,
      };
    }),
  );

  sendJsonResponse(
    res,
    200,
    "Modules fetched successfully",
    modulesWithProgress,
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
    "completedLessons completedModules quizAttempts",
  );

  const lessons = await Lesson.find({ moduleId: moduleId, isPublished: true });

  const completedLessonsInModule = getModuleLessonCompletion(
    lessons,
    user.completedLessons,
  );

  const allLessonsComplete = isModuleFinished(user.completedLessons, lessons);
  const isModuleComplete = user.completedModules.includes(moduleId.toString());

  const moduleQuizAttempts = user.quizAttempts.filter(
    (attempt) => attempt.moduleId.toString() === moduleId.toString(),
  );

  const bestAttempt =
    moduleQuizAttempts.length > 0
      ? moduleQuizAttempts.reduce((best, current) =>
          current.score > best.score ? current : best,
        )
      : null;

  const quizCompleted = hasPassedModuleQuiz(user, moduleId);

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

  const getModuleNumber = (order) => {
    return `M${order}`;
  };

  const lessonsWithProgress = lessons.map((lesson) => ({
    ...lesson,
    isCompleted: user.completedLessons.includes(lesson._id.toString()),
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

const getLessonContent = catchAsync(async (req, res, next) => {
  const { lessonId } = req.params;
  const userId = req.userId;

  const lesson = await Lesson.findById(lessonId)
    .populate("moduleId", "order title")
    .lean();

  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  const moduleId = lesson.moduleId._id;
  const moduleOrder = lesson.moduleId.order;

  const user = await User.findById(userId).select(
    "completedLessons lessonQuizProgress",
  );
  const isCompleted = user.completedLessons.includes(lessonId);

  // Get quiz progress for this lesson
  const quizProgress = user.lessonQuizProgress?.find(
    (qp) => qp.lessonId.toString() === lessonId,
  );

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
    moduleId: moduleId.toString(),
    moduleNumber: `M${lesson.moduleId.order}`,
    isCompleted,
    quizProgress: quizProgress
      ? {
          correctAnswers: quizProgress.correctAnswers,
          completed: quizProgress.completed,
          progress: quizProgress.correctAnswers.length,
          totalQuestions: lesson.quiz?.length || 0,
        }
      : null,
  });
});

const submitLesson = catchAsync(async (req, res, next) => {
  const { lessonId } = req.params;
  const userId = req.userId;
  const {
    answer,
    code,
    questionIndex = 0,
    validationResult,
    isCorrect = true,
    testsPassed,
  } = req.body;

  // 1. Fetch Lesson and User
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) return next(new AppError("Lesson not found", 404));

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  let feedback = validationResult?.feedback || "Great job!";

  const quizProgress = getOrCreateQuizProgress(user, lessonId, lesson);

  // 2. Validation Logic
  if (hasExercise(lesson) && code !== undefined) {
    if (!code || code.trim() === "") {
      return next(new AppError("No code submitted", 400));
    }

    isCorrectValue = isCorrect;
    feedback = validationResult?.feedback || "Code submitted successfully";
  } else if (hasQuiz(lesson) && answer !== undefined) {
    const currentQuestion = lesson.quiz[questionIndex];

    if (!currentQuestion)
      return next(new AppError("Invalid question index", 400));
    isCorrectValue = answer === currentQuestion.correctAnswer;

    if (isCorrectValue) {
      feedback = `Correct! ${currentQuestion.explanation || ""}`;
      updateQuizProgress(quizProgress, questionIndex, lesson);
    } else {
      feedback = `Try again! ${currentQuestion.explanation || ""}`;
    }
  } else if (
    (code === undefined && answer === undefined) ||
    lesson.contentType === "theory"
  ) {
    isCorrectValue = true;
    feedback = "Status checked/Theory completed!";

    if (quizProgress) quizProgress.completed = true;
  }

  const isManualCompletion = code === undefined && answer === undefined;
  const completed = isLessonFullyCompleted(
    lesson,
    quizProgress,
    isCorrectValue,
    isManualCompletion,
  );

  // 3. Process Full Completion
  if (completed) {
    const completionResult = await processLessonCompletion(
      user,
      lesson,
      req.body,
    );

    if (!user.completedLessons.includes(lessonId)) {
      user.completedLessons.push(lessonId);
    }

    const { totalCurriculumLessons, completedCurriculumCount } =
      await getCurriculumProgressStats(user, { Lesson, Module });

    // Evaluate badges
    const { newlyUnlocked, unlockedDetails } = await evaluateBadges(user, {
      type: "lesson_completion",
      lessonId,
      moduleCompleted: false,
    });

    if (newlyUnlocked?.length > 0) {
      newlyUnlocked.forEach((id) => {
        if (!user.badges.includes(id)) user.badges.push(id);
      });
    }

    await user.save();

    const progressData = formatProgressResponse(
      user.toObject(),
      totalCurriculumLessons,
      completedCurriculumCount,
    );

    return sendJsonResponse(res, 200, "Success!", {
      isCorrect: isCorrectValue,
      feedback,
      completed: true,
      xpEarned: completionResult.xpIncrease,
      progress: progressData,
      moduleCompleted: false,
      badgesUnlocked: unlockedDetails,
      nextLessonId: completionResult.nextLessonId,
    });
  }

  // 4. Partial Success (Correct answer but quiz/exercise not fully done)
  await user.save();
  return sendJsonResponse(
    res,
    200,
    isCorrectValue ? "Success!" : "Keep trying!",
    {
      isCorrect: isCorrectValue,
      feedback,
      completed: false,
    },
  );
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

  // Verify all lessons are completed
  const moduleLessons = await Lesson.find({
    moduleId: moduleId,
    isPublished: true,
  });

  const completedLessonsInModule = getModuleLessonCompletion(
    moduleLessons,
    user.completedLessons,
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

  // Record quiz attempt
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

  // Process module completion if passed
  let xpIncrease = 0;
  let moduleCompletedNow = false;
  let nextModuleId = null;
  let badgesUnlockedDetails = [];

  if (passed) {
    // Mark module as completed
    const moduleIdString = module._id.toString();

    if (!user.completedModules.includes(moduleIdString)) {
      user.completedModules.push(moduleIdString);
      xpIncrease = module.xpReward || 100;
      user.xp += xpIncrease;
      user.lastActive = new Date();
      moduleCompletedNow = true;

      // Add to history
      if (!Array.isArray(user.moduleCompletionHistory)) {
        user.moduleCompletionHistory = [];
      }
      user.moduleCompletionHistory.push({
        moduleId: module._id,
        completedAt: new Date(),
        quizScore: score,
      });

      // Find next module
      nextModuleId = await findNextModule(module);

      // Evaluate badges
      const { newlyUnlocked, unlockedDetails } = await evaluateBadges(user, {
        type: "module_completion",
        moduleId: module._id,
        quizScore: score,
      });

      badgesUnlockedDetails = unlockedDetails || [];

      // Add badges to user
      if (newlyUnlocked?.length > 0) {
        newlyUnlocked.forEach((id) => {
          if (!user.badges.includes(id)) user.badges.push(id);
        });
      }
    }
  }

  await user.save();

  // Get total lessons for progress calculation
  const totalLessons = await Lesson.countDocuments({ isPublished: true });
  const progressData = formatProgressResponse(user.toObject(), totalLessons);

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
    },
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

    const allLessonsDone = isModuleFinished(user.completedLessons, lessons);
    const quizPassed = hasPassedModuleQuiz(user, module._id);

    if (allLessonsDone && quizPassed) {
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
