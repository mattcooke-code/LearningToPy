// contentController.js
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { validateContent, validateEnum } = require("../utils/validationHelpers");
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
} = require("../utils/quizHelpers");

const {
  checkPrerequisites,
  hasPassedModuleQuiz,
  getModuleLessonCompletion,
} = require("../services/moduleProgress");

const { findNextLesson, findNextModule } = require("../utils/navigation");

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
const { calculateExerciseXP } = require("../../shared/constants/progress.cjs");

// ====== CONTROLLER FUNCTIONS ======
/**
 * Fetch all published modules with user progress metadata.
 *
 * For each module, calculates lesson completion %, quiz status,
 * prerequisite lock state, and overall completion.
 *
 * @route   GET /api/content/modules
 * @returns {Object} 200 - Array of modules with progress fields
 * @returns {Object} 401 - Unauthorized
 */
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

      // Check if module is locked based on prerequisites
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

/**
 * Fetch a single module with detailed user progress.
 *
 * Includes lesson completion count, quiz attempt history,
 * best quiz score, and whether module is fully complete.
 *
 * @route   GET /api/content/modules/:moduleId
 * @param   {string} moduleId - Module ID
 * @returns {Object} 200 - Module with progress details
 * @returns {Object} 404 - Module not found
 */
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

/**
 * Fetch all published lessons for a module with completion status.
 *
 * Strips exercise solutions and quiz answers from response.
 * Each lesson includes an `isCompleted` flag.
 *
 * @route   GET /api/content/modules/:moduleId/lessons
 * @param   {string} moduleId - Module ID
 * @returns {Object} 200 - Module header + lessons array with progress
 * @returns {Object} 404 - Module not found
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

/**
 * Fetch full lesson content, conditionally including answers.
 *
 * If the user has NOT completed the lesson, exercise solutions
 * and quiz correct answers are stripped. If completed, they are included
 * so the user can review.
 *
 * @route   GET /api/content/lessons/:lessonId
 * @param   {string} lessonId - Lesson ID
 * @returns {Object} 200 - Lesson content with quiz/exercise progress
 * @returns {Object} 404 - Lesson not found
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

  const moduleId = lesson.moduleId._id;
  const moduleOrder = lesson.moduleId.order;

  const user = await User.findById(userId).select(
    "completedLessons lessonQuizProgress",
  );
  const isCompleted = user.completedLessons.includes(lessonId);

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

/**
 * Submit a lesson attempt — handles exercises, quizzes, and theory lessons.
 *
 * **Submission types:**
 * - EXERCISE: Validates code via `validationResult` or `hasExercise`/`isCorrect`
 * - QUIZ: Checks answer against correctAnswer, tracks attempts per question
 * - THEORY / manual completion: Marked complete immediately
 *
 * **Partial vs full completion:**
 * - If the lesson is fully done (`isLessonFullyCompleted`), delegates to
 *   `processLessonCompletion` for full XP award, badge evaluation, streak tracking
 * - If only a quiz question or exercise attempt is submitted, awards partial XP
 *   via `calculateExerciseXP` or `calculateQuizAnswerXP`
 *
 * @route   POST /api/content/lessons/:lessonId/submit
 * @param   {string} lessonId - Lesson ID
 * @body    {string} [code] - User's code submission (exercise lessons)
 * @body    {number} [answer] - Answer index (quiz lessons)
 * @body    {number} [questionIndex=0] - Quiz question being answered
 * @body    {Object} [validationResult] - Frontend validation output
 * @body    {boolean} [isCorrect] - Whether the solution is correct
 * @body    {boolean} [testsPassed] - Whether all tests passed
 * @body    {Array}  [submissionHistory] - Previous code submissions
 * @body    {number} [attemptNumber] - Attempt count
 * @body    {boolean} [usedHints] - Whether hints were used
 * @body    {number} [elapsedSeconds] - Time taken
 * @body    {boolean} [wasOptimalSolution] - Whether optimal solution was reached
 * @body    {number} [moduleConfigReward] - Bonus XP from module config
 * @returns {Object} 200 - { isCorrect, feedback, completed, xpEarned, progress, badgesUnlocked, nextLessonId }
 * @returns {Object} 400 - Invalid question index or no code submitted
 * @returns {Object} 404 - Lesson or user not found
 */
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
    submissionHistory,
    attemptNumber,
    usedHints,
    elapsedSeconds,
    wasOptimalSolution,
    moduleConfigReward,
  } = req.body;

  // 1. Fetch Lesson and User
  const lesson = await Lesson.findById(lessonId).populate(
    "moduleId",
    "order phase",
  );
  if (!lesson) return next(new AppError("Lesson not found", 404));

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  let feedback = validationResult?.feedback || "Great job!";
  const quizProgress = getOrCreateQuizProgress(user, lessonId, lesson);

  let isCorrectValue = false;

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
      updateQuizProgress(quizProgress, questionIndex, isCorrectValue);
    } else {
      feedback = `Try again! ${currentQuestion.explanation || ""}`;
      updateQuizProgress(quizProgress, questionIndex, false);
    }
  } else if (
    (code === undefined && answer === undefined) ||
    lesson.contentType === "THEORY"
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

  // 3. Process Full Completion (delegated to learningEngine)
  if (completed) {
    // Prepare submission data for XP calculation
    const submissionData = {
      ...req.body,
      moduleConfigReward, // Pass hardcoded bonus if provided
    };

    const completionResult = await processLessonCompletion(
      user,
      lesson,
      submissionData,
    );

    // Evaluate badges (still needed here)
    const { newlyUnlocked, unlockedDetails } = await evaluateBadges(user, {
      type: "lesson_completion",
      lessonId,
    });

    if (newlyUnlocked?.length > 0) {
      newlyUnlocked.forEach((id) => {
        if (!user.badges.includes(id)) user.badges.push(id);
      });
    }

    // Track streak & save
    await trackCompletion(user);
    await user.save();

    // Trigger leaderboard badge check
    await checkLeaderboardBadges(user, User);

    // Get updated progress stats
    const { totalCurriculumLessons, completedCurriculumCount } =
      await getCurriculumProgressStats(user, { Lesson, Module });

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
      xpBreakdown: completionResult.xpBreakdown,
      progress: progressData,
      badgesUnlocked: unlockedDetails,
      nextLessonId: completionResult.nextLessonId,
    });
  }

  // 4. Partial Success (answer correct but lesson not fully done)
  let partialXPEarned = 0;

  if (hasExercise(lesson) && code !== undefined && isCorrectValue) {
    const submissions =
      req.body.submissionHistory || (req.body.attemptNumber ? [req.body] : []);
    const submissionCount = Math.max(1, submissions.length);
    const firstTryPass =
      submissionCount === 1 && (req.body.testsPassed || req.body.isCorrect);
    partialXPEarned = calculateExerciseXP(submissionCount, firstTryPass);

    user.xp = (user.xp || 0) + partialXPEarned;
  } else if (hasQuiz(lesson) && answer !== undefined && isCorrectValue) {
    const attempts = getQuestionAttempts(quizProgress, questionIndex);
    partialXPEarned = calculateQuizAnswerXP(attempts);

    user.xp = (user.xp || 0) + partialXPEarned;
  }

  await user.save();
  return sendJsonResponse(
    res,
    200,
    isCorrectValue ? "Success!" : "Keep trying!",
    {
      isCorrect: isCorrectValue,
      feedback,
      completed: false,
      xpEarned: partialXPEarned,
    },
  );
});

/**
 * Submit a module quiz after all lessons are completed.
 *
 * **Flow:**
 * 1. Verifies all lessons in the module are completed
 * 2. Grades each answer against correctAnswer
 * 3. Calculates score and determines pass/fail (passingScore from module config or 70)
 * 4. Records quiz attempt in user.quizAttempts
 * 5. If passed, delegates to `processModuleCompletion` for XP, badge evaluation,
 *    streak tracking, and leaderboard check
 * 6. Returns updated progress via `formatProgressResponse`
 *
 * @route   POST /api/content/modules/:moduleId/quiz
 * @param   {string} moduleId - Module ID
 * @body    {Object} answers - Map of questionId → selected answer index
 * @returns {Object} 200 - { passed, score, correctAnswers, totalQuestions, results, xpEarned, moduleCompleted, progress, badgesUnlocked, nextModuleId }
 * @returns {Object} 403 - Not all lessons completed
 * @returns {Object} 404 - Module or quiz not found
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
    moduleId: module._id,
    attemptedAt: new Date(),
    score,
    passed,
    answers: results,
  };

  if (!user.quizAttempts) user.quizAttempts = [];
  user.quizAttempts.push(quizAttempt);

  // Process module completion if passed (delegated to learningEngine)
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

    // Evaluate badges
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

  // Trigger leaderboard badge check after XP is persisted
  if (passed) await checkLeaderboardBadges(user, User);

  // Get updated progress stats
  const { totalCurriculumLessons, completedCurriculumCount } =
    await getCurriculumProgressStats(user, { Lesson, Module });

  const progressData = formatProgressResponse(
    user.toObject(),
    totalCurriculumLessons,
    completedCurriculumCount,
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
 *
 * Scans all published modules and auto-completes any where:
 * - All lessons are completed (`isModuleFinished`)
 * - Module quiz is passed (`hasPassedModuleQuiz`)
 * - Module is not already in `completedModules`
 *
 * Awards base module XP and records completion in history.
 * Admin-only — returns 403 for non-admin users.
 *
 * @route   POST /api/content/modules/fix-progress
 * @returns {Object} 200 - { fixedCount, modules: [...] }
 * @returns {Object} 403 - Not an admin
 * @returns {Object} 404 - User not found
 */
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
