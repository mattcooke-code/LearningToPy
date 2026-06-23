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
const {
  getCurriculumProgressStats,
  processLessonCompletion,
  processModuleCompletion,
} = require("../services/learningEngine");
const {
  getModuleOrderMap,
  calculateLevelFromModules,
} = require("../utils/levelUtils");
const {
  evaluateBadges,
  getBadgeProgress,
  checkLeaderboardBadges,
} = require("../services/gamification");
const {
  trackLessonView,
  trackCompletion,
  getStreakInfo,
} = require("../services/streakManager");
const {
  BADGE_DEFINITIONS_CORE,
} = require("../../shared/constants/badgeDefinitions.cjs");

// --- CONTROLLER FUNCTIONS ---

/**
 * Fetch the current user's full progress for the Dashboard.
 *
 * Determines the "current module" (first incomplete module after M0),
 * calculates curriculum-wide completion percentage, and formats
 * the response via `formatProgressResponse` for the frontend.
 *
 * If all 20 modules (M1–M20) are complete, signals course completion.
 *
 * @route   GET /api/progress/current
 * @returns {Object} 200 - Full progress object (level, XP, course %, current module, badges, stats)
 * @returns {Object} 404 - User not found
 */
const getCurrentProgress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.userId).lean();
  if (!user) return next(new AppError("User not found.", 404));

  // Fetch completions from new collections
  const [lessonCompletions, moduleCompletions] = await Promise.all([
    LessonCompletion.find({ userId: user._id }).select("lessonId").lean(),
    ModuleCompletion.find({ userId: user._id }).select("moduleId").lean(),
  ]);

  const completedLessonIds = lessonCompletions.map((lc) =>
    lc.lessonId.toString(),
  );
  const completedModuleIds = moduleCompletions.map((mc) =>
    mc.moduleId.toString(),
  );

  // Get all published modules with order
  const modules = await Module.find({ isPublished: true })
    .select("_id order title")
    .sort("order")
    .lean();

  const moduleOrderMap = await getModuleOrderMap();

  // Find current module (first incomplete module after M0)
  let currentModuleData = null;
  let lessonsCompleted = 0;
  let totalLessons = 0;

  const moduleIds = modules.map((m) => m._id);
  const allModuleLessons = await Lesson.find({
    moduleId: { $in: moduleIds },
    isPublished: true,
  })
    .select("_id moduleId")
    .lean();

  // Group by moduleId
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

  // If all modules complete
  if (!currentModuleData && completedModuleIds.length >= 20) {
    currentModuleData = null; // Signals course complete
  }

  // Build user object with arrays for the analytics service
  const userWithArrays = {
    ...user,
    completedLessons: completedLessonIds,
    completedModules: completedModuleIds,
    completedLessonsCount: lessonCompletions.length,
    completedModulesCount: moduleCompletions.length,
  };

  const { totalCurriculumLessons, completedCurriculumCount } =
    await getCurriculumProgressStats(userWithArrays, { Lesson, Module });

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
 * Returns three arrays:
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

  const { newlyUnlocked } = await evaluateBadges(enrichedUser);

  if (newlyUnlocked.length > 0) {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { badges: { $each: newlyUnlocked } },
    });
    enrichedUser.badges = [
      ...new Set([...(user.badges || []), ...newlyUnlocked]),
    ];
  }

  const badgeProgress = await getBadgeProgress(enrichedUser);

  const earned = [];
  const inProgress = [];
  const locked = [];

  const progressMap = new Map(
    badgeProgress.map((progressItem) => [
      progressItem.id,
      progressItem.progressPercentage,
    ]),
  );

  const earnedSet = new Set(enrichedUser.badges || []);

  BADGE_DEFINITIONS_CORE.forEach((badge) => {
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
      earned.push({
        ...baseDetails,
        completed: true,
        progressPercentage: 100,
      });
      return;
    }

    const progressPercentage = progressMap.get(badge.id) || 0;

    if (progressPercentage > 0) {
      inProgress.push({
        ...baseDetails,
        progressPercentage,
      });
    } else {
      locked.push({
        ...baseDetails,
        progressPercentage: 0,
      });
    }
  });

  sendJsonResponse(res, 200, "Achievements progress calculated successfully.", {
    earnedBadges: earned,
    inProgress: inProgress,
    locked: locked,
    totalBadges: BADGE_DEFINITIONS_CORE.length,
    earnedCount: earned.length,
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
  const userId = req.userId.toString();
  const range = 2;

  const currentUser = await User.findById(userId)
    .select("username xp privacySettings isAdmin")
    .lean();
  if (!currentUser) return next(new AppError("User not found", 404));

  const baseFilter = {
    "privacySettings.showOnLeaderboards": true,
    isAdmin: { $ne: true },
  };

  const [usersAbove, usersBelow, usersWithMoreXP, totalOptedIn] =
    await Promise.all([
      User.find({
        ...baseFilter,
        xp: { $gt: currentUser.xp },
      })
        .select("username xp privacySettings")
        .sort({ xp: 1 })
        .limit(range)
        .lean(),
      User.find({
        ...baseFilter,
        xp: { $lt: currentUser.xp },
        _id: { $ne: currentUser._id },
      })
        .select("username xp privacySettings")
        .sort({ xp: -1 })
        .limit(range)
        .lean(),
      User.countDocuments({
        ...baseFilter,
        xp: { $gt: currentUser.xp },
      }),
      User.countDocuments(baseFilter),
    ]);

  const rank = usersWithMoreXP + 1;
  const aboveReversed = usersAbove.reverse();

  const allSlice = [...aboveReversed, currentUser, ...usersBelow];

  const surroundingUsers = allSlice.map((user, index) => ({
    _id: user._id,
    rank: rank - aboveReversed.length + index,
    username: user.privacySettings?.showUsernameOnLeaderboards
      ? user.username
      : `Learner #${user._id.toString().slice(-6)}`,
    xp: user.xp,
    isCurrent: user._id.toString() === userId,
    isAnonymous: !user.privacySettings?.showUsernameOnLeaderboards,
  }));

  sendJsonResponse(res, 200, "User's leaderboard placement found", {
    users: surroundingUsers,
    currentUserRank: rank,
    totalUsers: totalOptedIn,
  });
});

/**
 * Get the top N users on the platform leaderboard (default 10).
 *
 * @route   GET /api/progress/leaderboard/top
 * @query   {number} [limit=10] - Number of top users to return
 * @returns {Object} 200 - { topUsersWithPrivacy: [...] }
 */
const getTopLeaderboard = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;

  const topUsers = await User.find({
    "privacySettings.showOnLeaderboards": true,
    isAdmin: { $ne: true },
  })
    .select("username xp privacySettings")
    .sort({ xp: -1 })
    .limit(limit)
    .lean();

  // Deduplicate by _id in case of index inconsistency after schema refactor
  const seen = new Set();
  const dedupedUsers = topUsers.filter((u) => {
    const id = u._id.toString();
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const topUsersWithPrivacy = dedupedUsers.map((user, index) => ({
    ...user,
    rank: index + 1,
    displayName: user.privacySettings?.showUsernameOnLeaderboards
      ? user.username
      : `Learner #${user._id.toString().slice(-6)}`,
    isAnonymous: !user.privacySettings?.showUsernameOnLeaderboards,
  }));

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
  const userId = req.userId;

  // Find users who completed this module via ModuleCompletion collection
  const moduleCompletions = await ModuleCompletion.find({ moduleId })
    .select("userId")
    .lean();

  const completedUserIds = moduleCompletions.map((mc) => mc.userId);

  const baseFilter = {
    _id: { $in: completedUserIds },
    "privacySettings.showOnLeaderboards": true,
    isAdmin: { $ne: true },
  };

  const moduleUsers = await User.find(baseFilter)
    .select("username xp privacySettings")
    .sort({ xp: -1 })
    .limit(50)
    .lean();

  const formattedUsers = moduleUsers.map((user, index) => ({
    _id: user._id,
    rank: index + 1,
    username: user.privacySettings?.showUsernameOnLeaderboards
      ? user.username
      : `Learner #${user._id.toString().slice(-6)}`,
    xp: user.xp,
    isCurrent: user._id.toString() === userId,
    isAnonymous: !user.privacySettings?.showUsernameOnLeaderboards,
  }));

  const rank =
    (await User.countDocuments({
      ...baseFilter,
      xp: { $gt: req.user.xp },
    })) + 1;

  sendJsonResponse(res, 200, "Module leaderboard fetched.", {
    users: formattedUsers,
    currentUserRank: rank,
    totalInModule: moduleUsers.length,
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

  const result = await processLessonCompletion(user, lesson, submissionData);

  const streakResult = await trackCompletion(user);
  await user.save();

  // Trigger leaderboard badge check after XP is persisted
  await checkLeaderboardBadges(user, User);

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
 * @returns {Object} 200 - { xpGained, newStreak, streakStatus, nextModuleId, newlyCompleted }
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

  const result = await processModuleCompletion(user, module, quizScore);

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

  const streakResult = await trackCompletion(user);
  await user.save();

  // Trigger leaderboard badge check after XP is persisted
  await checkLeaderboardBadges(user, User);

  sendJsonResponse(res, 200, "Module completed successfully", {
    xpGained: result.xpIncrease,
    newStreak: streakResult?.streak ?? user.streak,
    streakStatus: streakResult?.streakStatus,
    nextModuleId: result.nextModuleId,
    newlyCompleted: result.newlyCompleted,
  });
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
  const streakInfo = await getStreakInfo(req.userId);

  if (!streakInfo) {
    return next(new AppError("User not found", 404));
  }

  sendJsonResponse(res, 200, "Streak info retrieved", streakInfo);
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
};
