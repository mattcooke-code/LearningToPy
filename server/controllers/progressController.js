// progressController.js
const Lesson = require("../models/Lesson");
const LessonCompletion = require("../models/LessonCompletion");
const Module = require("../models/Module");
const ModuleCompletion = require("../models/ModuleCompletion");
const QuizAttempt = require("../models/QuizAttempt");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { sendJsonResponse } = require("../utils/responseHelpers");

const { formatProgressResponse } = require("../services/analytics");
const engine = require("../services/learningEngine");
const gamify = require("../services/gamification");
const leaderboard = require("../services/leaderboardService");
const manageStreak = require("../services/streakManager");
const {
  BADGE_DEFINITIONS_CORE,
} = require("../../shared/constants/badgeDefinitions.cjs");

// --- CONTROLLER FUNCTIONS ---

/**
 * Fetch the current user's full progress for the Dashboard.
 *
 * @route   GET /api/progress/current
 * @returns {Object} 200 - Full progress object (level, XP, course %, current module, badges, stats)
 * @returns {Object} 404 - User not found
 */
const getCurrentProgress = catchAsync(async (req, res, next) => {
  const progressSummary = await engine.getUserProgressSummary(req.userId);
  if (!progressSummary) return next(new AppError("User not found.", 404));

  const {
    userWithArrays,
    totalCurriculumLessons,
    completedCurriculumCount,
    currentModuleData,
    moduleOrderMap,
  } = progressSummary;

  if (userWithArrays.courseProgressPercentage !== undefined) {
    // If theme updating happens here or via hook
  }

  const progressData = formatProgressResponse(
    userWithArrays,
    totalCurriculumLessons,
    completedCurriculumCount,
    currentModuleData,
    moduleOrderMap,
  );

  sendJsonResponse(res, 200, "Progress fetched", progressData);
});

/**
 * Evaluate all badges and categorize them as earned, in-progress, or locked.
 *
 * Calls `evaluateBadges` to detect newly unlocked badges since last check,
 * persists any new ones, then calls `getBadgeProgress` to calculate
 * 0–100 progress for every badge in BADGE_DEFINITIONS_CORE.
 *
 * Returns single array with a status field for:
 * - **earned**: Badges the user has (progress = 100)
 * - **inProgress**: Badges with progress > 0 but not yet earned
 * - **locked**: Badges with 0 progress
 *
 * @route   GET /api/progress/achievements
 * @returns {Object} 200 - { earnedBadges, inProgress, locked, totalBadges, earnedCount }
 * @returns {Object} 404 - User not found
 */
const getAchievements = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const user = await User.findById(userId)
    .select(
      "username badges streak createdAt privacySettings stats completedLessonsCount completedModulesCount",
    )
    .lean({ virtuals: true });

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  // Fetch completion data from new collections
  const [lessonCompletions, moduleCompletions, quizAttempts] =
    await Promise.all([
      LessonCompletion.find({ userId }).lean(),
      ModuleCompletion.find({ userId }).lean(),
      QuizAttempt.find({ userId }).lean(),
    ]);

  // Build enriched user object matching what evaluateBadges expects
  const enrichedUser = {
    ...user,
    completedLessons: lessonCompletions.map((lc) => lc.lessonId.toString()),
    completedModules: moduleCompletions.map((mc) => mc.moduleId.toString()),
    lessonCompletionHistory: lessonCompletions,
    moduleCompletionHistory: moduleCompletions,
    quizAttempts: quizAttempts,
  };

  const { newlyUnlocked } = await gamify.evaluateBadges(enrichedUser);

  if (newlyUnlocked.length > 0) {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { badges: { $each: newlyUnlocked } },
    });
    enrichedUser.badges = [
      ...new Set([...(user.badges || []), ...newlyUnlocked]),
    ];
  }

  const badgeProgress = await gamify.getBadgeProgress(enrichedUser);

  const progressMap = new Map(
    badgeProgress.map((progressItem) => [
      progressItem.id,
      progressItem.progressPercentage,
    ]),
  );

  const earnedSet = new Set(enrichedUser.badges || []);

  // Map into a single unified array with a status field (REST-compliant)
  const badgesWithStatus = BADGE_DEFINITIONS_CORE.map((badge) => {
    const baseDetails = {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      category: badge.category,
      tier: badge.tier ?? null,
      module: badge.module ?? null,
      phase: badge.phase ?? null,
    };

    if (earnedSet.has(badge.id)) {
      return {
        ...baseDetails,
        status: "earned",
        completed: true,
        progressPercentage: 100,
      };
    }

    const progressPercentage = progressMap.get(badge.id) || 0;

    if (progressPercentage > 0) {
      return { ...baseDetails, status: "inProgress", progressPercentage };
    }

    return { ...baseDetails, status: "locked", progressPercentage: 0 };
  });

  const earnedCount = badgesWithStatus.filter(
    (b) => b.status === "earned",
  ).length;

  sendJsonResponse(res, 200, "Achievements progress calculated successfully.", {
    badges: badgesWithStatus,
    totalBadges: BADGE_DEFINITIONS_CORE.length,
    earnedCount: earnedCount,
  });
});

/**
 * Get the leaderboard slice surrounding the current user (±2 ranks).
 *
 * Fetches all non-admin users who have opted into leaderboards, sorts by XP,
 * finds the current user's position, and returns a window of nearby users.
 * Respects privacy settings — users who hide usernames appear as "Learner #XXXXXX".
 *
 * @route   GET /api/progress/leaderboard/around-me
 * @returns {Object} 200 - { users: [...], currentUserRank, totalUsers }
 * @returns {Object} 404 - User not found or not on leaderboard
 */
const getSurroundingLeaderboard = catchAsync(async (req, res, next) => {
  const result = await leaderboard.getSurroundingUsers(req.userId);
  if (!result) return next(new AppError("User not found", 404));

  if (result.message) {
    return sendJsonResponse(res, 200, "User not eligible for leaderboard", {
      users: [],
      currentRank: null,
      totalUsers: 0,
      message: result.message,
    });
  }

  sendJsonResponse(res, 200, "User's leaderboard placement found", result);
});

/**
 * Get the top N users on the platform leaderboard (default 10).
 *
 * @route   GET /api/progress/leaderboard/top
 * @query   {number} [limit=10] - Number of top users to return
 * @returns {Object} 200 - { topUsersWithPrivacy: [...] }
 */
const getTopLeaderboard = catchAsync(async (req, res, next) => {
  const topUsersWithPrivacy = await leaderboard.getTopUsers(req.query.limit);

  sendJsonResponse(res, 200, "Top leaderboard fetched", {
    topUsersWithPrivacy,
  });
});

/**
 * Get the leaderboard for a specific module — users who completed it, sorted by XP.
 *
 * Also calculates the requesting user's rank within that module's leaderboard.
 *
 * @route   GET /api/progress/leaderboard/module/:moduleId
 * @param   {string} moduleId - Module ID
 * @returns {Object} 200 - { users, currentUserRank, totalInModule }
 */
const getModuleLeaderboard = catchAsync(async (req, res, next) => {
  const { moduleId } = req.params;
  const users = await leaderboard.getModuleLeaderboardData(moduleId);

  sendJsonResponse(res, 200, "Module leaderboard fetched.", {
    users,
  });
});

/**
 * Record that a user has started viewing a lesson.
 *
 * Lightweight endpoint — validates the lesson exists, then returns a timestamp.
 * Does not modify user state (no XP, no completion).
 *
 * @route   POST /api/progress/lessons/:lessonId/start
 * @param   {string} lessonId - Lesson ID
 * @returns {Object} 200 - { lessonId, timestamp }
 * @returns {Object} 404 - Lesson not found
 */
const startLesson = catchAsync(async (req, res, next) => {
  const { lessonId } = req.params;

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  sendJsonResponse(res, 200, "Lesson started", {
    lessonId,
    timestamp: new Date(),
  });
});

/**
 * Complete a lesson and award XP.
 *
 * Delegates to `processLessonCompletion` for all XP calculation,
 * then tracks streak via `trackCompletion`, persists the user,
 * and checks for leaderboard badges.
 *
 * @route   POST /api/progress/lessons/:lessonId/complete
 * @param   {string} lessonId - Lesson ID
 * @body    {Object} submissionData - Passed directly to processLessonCompletion
 * @returns {Object} 200 - { xpGained, newStreak, streakStatus, nextLessonId, newlyCompleted }
 * @returns {Object} 404 - User or lesson not found
 */
const completeLesson = catchAsync(async (req, res, next) => {
  const { lessonId } = req.params;
  const submissionData = req.body;

  const user = await User.findById(req.userId);
  const lesson = await Lesson.findById(lessonId);

  if (!user || !lesson) {
    return next(new AppError("User or lesson not found", 404));
  }

  const result = await engine.processLessonCompletion(
    user,
    lesson,
    submissionData,
  );

  if (!result.newlyCompleted) {
    return sendJsonResponse(
      res,
      200,
      "Lesson already completed (practice mode)",
      {
        xpGained: 0,
        newStreak: user.streak,
        streakStatus: user.streakStatus,
        nextLessonId: result.nextLessonId,
        newlyCompleted: false,
        practiceMode: true,
      },
    );
  }

  const streakResult = await manageStreak.trackCompletion(user);
  await user.save();

  // Trigger leaderboard badge check after XP is persisted
  await gamify.checkLeaderboardBadges(user, User);

  sendJsonResponse(res, 200, "Lesson completed successfully", {
    xpGained: result.xpIncrease,
    newStreak: streakResult?.streak ?? user.streak,
    streakStatus: streakResult?.streakStatus,
    nextLessonId: result.nextLessonId,
    newlyCompleted: result.newlyCompleted,
  });
});

/**
 * Complete a module with quiz results.
 *
 * Delegates to `processModuleCompletion` for XP calculation,
 * records the quiz attempt on the user, tracks streak,
 * and checks for leaderboard badges.
 *
 * @route   POST /api/progress/modules/:moduleId/complete
 * @param   {string} moduleId - Module ID
 * @body    {number} quizScore - Quiz score (0–100)
 * @body    {Array}  [answers] - Quiz answers to record in history
 * @returns {Object} 200 - {
 * xpGained,
 * newStreak,
 * streakStatus,
 * nextModuleId,
 * newlyCompleted,
 * courseCompleted?,
 * hofEligibleAt?,
 * daysUntilHof?
 * }
 * @returns {Object} 404 - User or module not found
 */
const completeModule = catchAsync(async (req, res, next) => {
  const { moduleId } = req.params;
  const { quizScore, answers } = req.body;

  const user = await User.findById(req.userId);
  const module = await Module.findById(moduleId);

  if (!user || !module) {
    return next(new AppError("User or module not found", 404));
  }

  const result = await engine.processModuleCompletion(user, module, quizScore);

  // Record quiz attempt in the new QuizAttempt collection
  if (answers && quizScore !== undefined) {
    await QuizAttempt.create({
      userId: user._id,
      moduleId: module._id,
      attemptedAt: new Date(),
      score: quizScore,
      passed: quizScore >= 70,
      answers,
    });
  }

  const streakResult = await manageStreak.trackCompletion(user);
  await user.save();

  // Trigger leaderboard badge check after XP is persisted
  await gamify.checkLeaderboardBadges(user, User);

  const responsePayload = {
    xpGained: result.xpIncrease,
    newStreak: streakResult?.streak ?? user.streak,
    streakStatus: streakResult?.streakStatus,
    nextModuleId: result.nextModuleId,
    newlyCompleted: result.newlyCompleted,
  };

  if (result.courseCompleted) {
    responsePayload.courseCompleted = true;
    responsePayload.hofEligibleAt = result.hofEligibleAt;
    responsePayload.daysUntilHof = 30;
  }

  sendJsonResponse(res, 200, "Module completed successfully", responsePayload);
});

/**
 * Get the current user's streak information.
 *
 * Returns days active, completions this week, warning day, days remaining,
 * and current streak status (ACTIVE, WARNING, AT_RISK, RESETTING).
 *
 * @route   GET /api/progress/streak
 * @returns {Object} 200 - Streak info object
 * @returns {Object} 404 - User not found
 */
const checkStreak = catchAsync(async (req, res, next) => {
  const streakInfo = await manageStreak.getStreakInfo(req.userId);

  if (!streakInfo) {
    return next(new AppError("User not found", 404));
  }

  sendJsonResponse(res, 200, "Streak info retrieved", streakInfo);
});

/**
 * Get the Hall of Fame — all users who have been inducted.
 * Sorted by completion date (earliest first = rank 1).
 * Supports optional pagination.
 *
 * @route   GET /api/progress/hall-of-fame
 * @query   {number} [page=1]
 * @query   {number} [limit=20]
 * @returns {Object} 200 - { members, totalInducted, page, totalPages }
 */
const getHallOfFame = catchAsync(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

  const result = await engine.getHallOfFameMembers(page, limit);
  sendJsonResponse(res, 200, "Hall of Fame fetched", result);
});

/**
 * Allow a student who has completed the course to opt into the
 * Hall of Fame early, before the 30-day window expires.
 *
 * @route   POST /api/progress/hall-of-fame/opt-in
 * @returns {Object} 200 - { hofRank, message }
 * @returns {Object} 400 - Already inducted or not eligible
 * @returns {Object} 404 - No course completion record found
 */
const optInToHallOfFame = catchAsync(async (req, res, next) => {
  const userId = req.userId;

  try {
    const result = await engine.optInUserToHoF(userId);
    sendJsonResponse(res, 200, "Welcome to the Hall of Fame!", {
      hofRank: result.hofRank,
      inductedAt: result.inductedAt,
      earlyOptIn: true,
    });
  } catch (err) {
    return next(error);
  }
});

/**
 * Get current user's course completion and HoF status
 *
 * @route GET /api/progress/course-completion
 * @returns {Object} 200 - Course completion status
 * @returns {Object} 200 - Default object when no completion record exists
 */
const getCourseCompletionStatus = catchAsync(async (req, res, next) => {
  const status = await engine.getCourseStatusForUser(req.userId);
  const message = status.courseCompleted
    ? "Course completion status fetched"
    : "No course completion record";

  sendJsonResponse(res, 200, message, status);
});

module.exports = {
  getCurrentProgress,
  getAchievements,
  getSurroundingLeaderboard,
  getTopLeaderboard,
  getModuleLeaderboard,
  startLesson,
  completeLesson,
  completeModule,
  checkStreak,
  getHallOfFame,
  optInToHallOfFame,
  getCourseCompletionStatus,
};
