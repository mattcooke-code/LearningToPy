// progressController.js
const User = require("../models/User");
const AppError = require("../utils/AppError");
const Lesson = require("../models/Lesson");
const Module = require("../models/Module");
const catchAsync = require("../utils/catchAsync");
const { sendJsonResponse } = require("../utils/responseHelpers");

const { formatProgressResponse } = require("../utils/analytics");
const {
  getCurriculumProgressStats,
  processLessonCompletion,
  processModuleCompletion,
} = require("../utils/learningEngine");
const {
  evaluateBadges,
  getBadgeProgress,
  checkLeaderboardBadges,
} = require("../utils/gamification");
const {
  trackLessonView,
  trackCompletion,
  getStreakInfo,
} = require("../utils/streakManager");
const {
  BADGE_DEFINITIONS_CORE,
} = require("../../shared/constants/badgeDefinitions");

// --- CONTROLLER FUNCTIONS ---

const getCurrentProgress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.userId).lean();
  if (!user) return next(new AppError("User not found.", 404));

  const { totalCurriculumLessons, completedCurriculumCount } =
    await getCurriculumProgressStats(user, { Lesson, Module });

  const progressData = formatProgressResponse(
    user,
    totalCurriculumLessons,
    completedCurriculumCount,
  );
  sendJsonResponse(res, 200, "Progress fetched", progressData);
});

const getAchievements = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const user = await User.findById(userId)
    .select(
      "username completedLessons completedModules badges streak createdAt moduleCompletionHistory lessonCompletionHistory quizAttempts privacySettings stats",
    )
    .lean({ virtuals: true });

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  const { newlyUnlocked } = await evaluateBadges(user);

  if (newlyUnlocked.length > 0) {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { badges: { $each: newlyUnlocked } },
    });
    user.badges = [...new Set([...(user.badges || []), ...newlyUnlocked])];
  }

  const badgeProgress = await getBadgeProgress(user);

  const earned = [];
  const inProgress = [];
  const locked = [];

  const progressMap = new Map(
    badgeProgress.map((progressItem) => [
      progressItem.id,
      progressItem.progressPercentage,
    ]),
  );

  const earnedSet = new Set(user.badges || []);

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

const getSurroundingLeaderboard = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const range = 2;

  const currentUser = await User.findById(userId);
  if (!currentUser) {
    return next(new AppError("User not found", 404));
  }

  const allUsers = await User.find({
    "privacySettings.showOnLeaderboards": true,
  })
    .select("username xp privacySettings")
    .sort({ xp: -1 })
    .lean();

  const usersWithPrivacy = allUsers.map((user) => ({
    ...user,
    displayName: user.privacySettings?.showUsernameOnLeaderboards
      ? user.username
      : `Learner #${user._id.toString().slice(-6)}`,
    isAnonymous: !user.privacySettings?.showUsernameOnLeaderboards,
  }));

  const currentUserIndex = usersWithPrivacy.findIndex(
    (user) => user._id.toString() === userId,
  );

  if (currentUserIndex === -1) {
    return next(new AppError("User not found on leaderboard", 404));
  }

  const startIndex = Math.max(0, currentUserIndex - range);
  const endIndex = Math.min(
    usersWithPrivacy.length - 1,
    currentUserIndex + range,
  );

  const surroundingUsers = usersWithPrivacy
    .slice(startIndex, endIndex + 1)
    .map((user, index) => ({
      _id: user._id,
      rank: startIndex + index + 1,
      username: user.displayName,
      xp: user.xp,
      isCurrent: user._id.toString() === userId,
      isAnonymous: user.isAnonymous,
    }));

  sendJsonResponse(res, 200, "User's leaderboard placement found", {
    users: surroundingUsers,
    currentUserRank: currentUserIndex + 1,
    totalUsers: usersWithPrivacy.length,
  });
});

const getTopLeaderboard = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;

  const topUsers = await User.find({
    "privacySettings.showOnLeaderboards": true,
  })
    .select("username xp privacySettings")
    .sort({ xp: -1 })
    .limit(limit)
    .lean();

  const topUsersWithPrivacy = topUsers.map((user, index) => ({
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

const getModuleLeaderboard = catchAsync(async (req, res, next) => {
  const { moduleId } = req.params;
  const userId = req.userId;

  const moduleUsers = await User.find({
    completedModules: moduleId,
    "privacySettings.showOnLeaderboards": true,
  })
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

  const currentUser = await User.findById(userId).select("xp");
  const rank =
    (await User.countDocuments({
      completedModules: moduleId,
      "privacySettings.showOnLeaderboards": true,
      xp: { $gt: currentUser.xp },
    })) + 1;

  sendJsonResponse(res, 200, "Module leaderboard fetched.", {
    users: formattedUsers,
    currentUserRank: rank,
    totalInModule: moduleUsers.length,
  });
});

const completeLesson = catchAsync(async (req, res, next) => {
  const { lessonId } = req.params;
  const submissionData = req.body;

  const user = await User.findById(req.userId);
  const lesson = await Lesson.findById(lessonId);

  if (!user || !lesson) {
    return next(new AppError("User or lesson not found", 404));
  }

  const result = await processLessonCompletion(user, lesson, submissionData);

  // Pass the already-fetched user document
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

const completeModule = catchAsync(async (req, res, next) => {
  const { moduleId } = req.params;
  const { quizScore, answers } = req.body;

  const user = await User.findById(req.userId);
  const module = await Module.findById(moduleId);

  if (!user || !module) {
    return next(new AppError("User or module not found", 404));
  }

  const result = await processModuleCompletion(user, module, quizScore);

  if (answers && quizScore !== undefined) {
    user.quizAttempts.push({
      moduleId: module._id,
      attemptedAt: new Date(),
      score: quizScore,
      passed: quizScore >= 70,
      answers,
    });
  }

  // Pass the already-fetched user document — avoids a second DB read
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

// UPDATED: replaced calculateStreakUpdate logic with getStreakInfo
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
  completeLesson,
  completeModule,
  checkStreak,
};
