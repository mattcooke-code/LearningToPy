/**
 * Analytics Controller — 3 functions for platform metrics.
 *
 * Uses `analyticsCache` for read-through caching of expensive aggregation queries.
 * All routes require admin authentication.
 *
 * @middleware adminOnly - Required on all routes
 */
const Activity = require("../models/ActivityLog");
const Lesson = require("../models/Lesson");
const LessonCompletion = require("../models/LessonCompletion");
const Module = require("../models/Module");
const User = require("../models/User");
const { withCache, invalidatePrefix } = require("../utils/analyticsCache");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { sendJsonResponse } = require("../utils/responseHelpers");

const ACTIVITY_COLLECTION = Activity.collection.name;
const WEEKS_TO_TRACK = [1, 2, 3, 4];

// ---------------------------------------------------------------------------
// Date range helper
// ---------------------------------------------------------------------------
/**
 * Calculate a date range based on a named range or custom start/end dates.
 *
 * Supported named ranges: "24h", "7d", "30d", "90d", "1y", "all".
 * Defaults to "30d" if the range is unrecognized.
 * Custom dates take precedence over named ranges.
 *
 * @param   {string}  range       - Named range ("24h", "7d", "30d", "90d", "1y", "all")
 * @param   {string}  [customStart] - ISO date string for custom start
 * @param   {string}  [customEnd]   - ISO date string for custom end
 * @returns {{ start: Date, end: Date }} Date range object
 */
const getDateRange = (range, customStart, customEnd) => {
  const now = new Date();
  let startDate = new Date();
  const endDate = new Date();

  if (customStart && customEnd) {
    return { start: new Date(customStart), end: new Date(customEnd) };
  }

  switch (range) {
    case "24h":
      startDate.setHours(now.getHours() - 24);
      break;
    case "7d":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(now.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(now.getDate() - 90);
      break;
    case "1y":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case "all":
      startDate = new Date(0);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }

  return { start: startDate, end: endDate };
};

// ---------------------------------------------------------------------------
// Retention helper
// ---------------------------------------------------------------------------
/**
 * Calculate weekly retention cohorts for users who signed up within a date range.
 *
 * For each monthly cohort, tracks how many users returned in weeks 1, 2, 3, and 4
 * after their signup date. Uses indexed activity lookups for performance.
 *
 * @param   {Date} startDate - Cohort window start
 * @param   {Date} endDate   - Cohort window end
 * @returns {Object} Cohorts keyed by "YYYY-MM" with total users and per-week active counts
 */
const calculateRetention = async (startDate, endDate) => {
  const users = await User.find({
    createdAt: { $gte: startDate, $lte: endDate },
  }).select("_id createdAt");

  if (users.length === 0) return {};

  const allActivity = await Activity.find({
    userId: { $in: users.map((u) => u._id) },
    timestamp: { $gte: startDate },
  }).select("userId timestamp");

  // Index activity dates by userId — use Set for O(1) lookup per boundary check
  const activityByUser = {};
  for (const log of allActivity) {
    const uid = log.userId.toString();
    if (!activityByUser[uid]) activityByUser[uid] = new Set();
    activityByUser[uid].add(log.timestamp.toISOString().slice(0, 10));
  }

  // Pre-compute week boundaries per user to avoid creating Date objects in inner loop
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
  const WEEK_OFFSETS = WEEKS_TO_TRACK.map((w) => w * MS_PER_WEEK);

  const cohorts = {};

  for (const user of users) {
    const cohortKey = user.createdAt.toISOString().slice(0, 7);

    if (!cohorts[cohortKey]) {
      cohorts[cohortKey] = {
        total: 0,
        ...Object.fromEntries(WEEKS_TO_TRACK.map((w) => [`week${w}`, 0])),
      };
    }

    cohorts[cohortKey].total++;

    const activityDates = activityByUser[user._id.toString()];
    if (!activityDates) continue;

    const userCreatedTime = user.createdAt.getTime();

    for (let i = 0; i < WEEKS_TO_TRACK.length; i++) {
      const boundaryTime = userCreatedTime + WEEK_OFFSETS[i];
      const boundaryStr = new Date(boundaryTime).toISOString().slice(0, 10);

      // Set.has() is O(1) — replaces O(n) Array.some()
      if (activityDates.has(boundaryStr)) {
        cohorts[cohortKey][`week${WEEKS_TO_TRACK[i]}`]++;
      }
    }
  }

  return cohorts;
};

/**
 * Format raw retention cohort data into an array with calculated percentage rates.
 * Computes week1Rate, week2Rate, week3Rate, week4Rate for each cohort.
 *
 * @param   {Object} retentionData - Raw cohort data from calculateRetention
 * @returns {Array}  Array of cohort objects with rates
 */
const formatRetentionCohorts = (retentionData) =>
  Object.entries(retentionData).map(([cohort, data]) => ({
    cohort,
    ...data,
    ...Object.fromEntries(
      WEEKS_TO_TRACK.map((w) => [
        `week${w}Rate`,
        data.total > 0 ? (data[`week${w}`] / data.total) * 100 : 0,
      ]),
    ),
  }));

// ---------------------------------------------------------------------------
// Query groups — each fetches one logical slice of the analytics
// ---------------------------------------------------------------------------

/**
 * Fetch user statistics: total users, active users (within date window),
 * new signups, and retention cohorts.
 *
 * Runs 3 count queries in parallel, then calculates retention.
 * Retention errors are caught and logged — they don't fail the request.
 *
 * @param   {Date} start - Window start
 * @param   {Date} end   - Window end
 * @returns {Object} { total, active, new, retention }
 */
const fetchUserStats = async (start, end) => {
  const [total, active, newUsers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ lastActive: { $gte: start } }),
    User.countDocuments({ createdAt: { $gte: start } }),
  ]);

  let retention = [];
  try {
    const retentionData = await calculateRetention(start, end);
    retention = formatRetentionCohorts(retentionData);
  } catch (err) {
    console.error("[analyticsController] Retention calculation failed:", err);
  }

  return {
    total,
    active,
    new: newUsers,
    retention,
  };
};

/**
 * Fetch content statistics: lesson/module counts, total completions,
 * aggregate XP, and lesson start→complete conversion rate for the period.
 *
 * Runs 6 queries in parallel via Promise.all.
 *
 * @param   {Date} start - Window start (completion rate window)
 * @returns {Object} { totalLessons, totalModules, lessonsCompleted, totalXP, completionRate }
 */
const fetchContentStats = async (start) => {
  const [totalLessons, totalModules, totalXP, totalStarts, totalCompletes] =
    await Promise.all([
      Lesson.countDocuments({ isPublished: true }),
      Module.countDocuments({ isPublished: true }),
      User.aggregate([{ $group: { _id: null, total: { $sum: "$xp" } } }]),
      Activity.countDocuments({
        actionType: "LESSON_START",
        timestamp: { $gte: start },
      }),
      Activity.countDocuments({
        actionType: "LESSON_COMPLETE",
        timestamp: { $gte: start },
      }),
    ]);

  // Count total lesson completions from the new LessonCompletion collection
  const lessonsCompleted = await LessonCompletion.countDocuments();

  return {
    totalLessons,
    totalModules,
    lessonsCompleted,
    totalXP: totalXP[0]?.total || 0,
    completionRate:
      totalStarts > 0
        ? Math.round((totalCompletes / totalStarts) * 1000) / 10
        : 0,
  };
};

/**
 * Fetch time-series activity data for charts and rankings.
 *
 * Returns three datasets:
 * - **dailyActivity**: Actions grouped by day/hour with per-action counts and completion rate
 * - **userGrowth**: Cumulative user signups over time
 * - **contentPerformance**: Top 20 lessons by completions with per-lesson metrics
 *
 * Uses MongoDB aggregation pipelines with $lookup joins to the Activity collection.
 *
 * @param   {Date}   start   - Window start
 * @param   {Date}   end     - Window end
 * @param   {string} groupBy - "hour", "day", or "month" for date grouping
 * @returns {Object} { dailyActivity, userGrowth, contentPerformance }
 */
const fetchActivityStats = async (start, end, groupBy) => {
  const [dailyActivity, rawUserGrowth, allLessons, lessonCompletions] =
    await Promise.all([
      // Daily activity breakdown (unchanged)
      Activity.aggregate([
        { $match: { timestamp: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupBy === "hour" ? "%Y-%m-%d %H:00" : "%Y-%m-%d",
                date: "$timestamp",
              },
            },
            activeUsers: { $addToSet: "$userId" },
            pageViews: { $sum: 1 },
            lessonStarts: {
              $sum: { $cond: [{ $eq: ["$actionType", "LESSON_START"] }, 1, 0] },
            },
            lessonCompletes: {
              $sum: {
                $cond: [{ $eq: ["$actionType", "LESSON_COMPLETE"] }, 1, 0],
              },
            },
            quizAttempts: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "$actionType",
                      ["QUIZ_ATTEMPT", "QUIZ_CORRECT", "QUIZ_INCORRECT"],
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            codeRuns: {
              $sum: { $cond: [{ $eq: ["$actionType", "CODE_RUN"] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            date: "$_id",
            activeUsers: { $size: "$activeUsers" },
            pageViews: 1,
            lessonStarts: 1,
            lessonCompletes: 1,
            quizAttempts: 1,
            codeRuns: 1,
            completionRate: {
              $cond: [
                { $gt: ["$lessonStarts", 0] },
                {
                  $multiply: [
                    { $divide: ["$lessonCompletes", "$lessonStarts"] },
                    100,
                  ],
                },
                0,
              ],
            },
          },
        },
        { $sort: { date: 1 } },
      ]),

      // User growth (unchanged)
      User.aggregate([
        { $match: { createdAt: { $lte: end } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupBy === "month" ? "%Y-%m" : "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            newUsers: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // All published lessons (replaces $lookup on Activity for completions)
      Lesson.find({ isPublished: true })
        .select("title moduleId difficulty xpReward")
        .lean(),

      // Completion counts from LessonCompletion collection
      LessonCompletion.aggregate([
        { $group: { _id: "$lessonId", completions: { $sum: 1 } } },
      ]),
    ]);

  // Build completion lookup map
  const completionMap = new Map(
    lessonCompletions.map((lc) => [lc._id.toString(), lc.completions]),
  );

  // Build content performance without $lookup on Activity
  const contentPerformance = allLessons
    .map((lesson) => {
      const completions = completionMap.get(lesson._id.toString()) || 0;
      return {
        _id: lesson._id,
        title: lesson.title,
        moduleId: lesson.moduleId,
        difficulty: lesson.difficulty,
        xpReward: lesson.xpReward,
        completions,
        starts: 0, // Requires Activity data — omitted for now (can be added back with a single $lookup if needed)
        avgTimeSpent: 0,
        completionRate: 0,
      };
    })
    .sort((a, b) => b.completions - a.completions)
    .slice(0, 20);

  // Compute cumulative user growth
  let running = 0;
  const userGrowth = rawUserGrowth.map((entry) => {
    running += entry.newUsers;
    return { ...entry, cumulativeUsers: running };
  });

  return { dailyActivity, userGrowth, contentPerformance };
};

/**
 * Fetch demographic statistics: device/platform breakdown and user segmentation
 * by experience level (BEGINNER, INTERMEDIATE, ADVANCED, Expert).
 *
 * Device percentages are computed in JS from raw counts for precision.
 * User segments include avgLevel, avgXP, and avgLessonsCompleted.
 *
 * @param   {Date} start - Window start for device stats
 * @returns {Object} { devices, userSegments }
 */
const fetchDemographicStats = async (start) => {
  const [rawDeviceStats, userSegments] = await Promise.all([
    Activity.aggregate([
      {
        $match: {
          timestamp: { $gte: start },
          "metadata.deviceInfo.platform": { $exists: true },
        },
      },
      { $group: { _id: "$metadata.deviceInfo.platform", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Single aggregation — includes userIds for LessonCompletion lookup
    User.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ["$level", 2] }, then: "BEGINNER" },
                { case: { $lte: ["$level", 5] }, then: "INTERMEDIATE" },
                { case: { $lte: ["$level", 8] }, then: "ADVANCED" },
              ],
              default: "Expert",
            },
          },
          count: { $sum: 1 },
          avgLevel: { $avg: "$level" },
          avgXP: { $avg: "$xp" },
          userIds: { $push: "$_id" }, // Collected for LessonCompletion counts below
        },
      },
      {
        $project: {
          segment: "$_id",
          count: 1,
          avgLevel: { $round: ["$avgLevel", 1] },
          avgXP: { $round: ["$avgXP", 0] },
          userIds: 1,
        },
      },
      { $sort: { avgLevel: 1 } },
    ]),
  ]);

  // Compute device percentages
  const deviceTotal = rawDeviceStats.reduce((sum, d) => sum + d.count, 0);
  const devices = rawDeviceStats.map((d) => ({
    device: d._id,
    count: d.count,
    percentage:
      deviceTotal > 0 ? Math.round((d.count / deviceTotal) * 10000) / 100 : 0,
  }));

  // Count LessonCompletion per segment using the userIds we already collected
  const segmentCompletions = await Promise.all(
    userSegments.map(async (seg) => {
      const count = await LessonCompletion.countDocuments({
        userId: { $in: seg.userIds },
      });
      return {
        segment: seg.segment,
        totalCompletions: count,
        userCount: seg.userIds.length,
      };
    }),
  );

  const completionMap = new Map(
    segmentCompletions.map((sc) => [sc.segment, sc]),
  );

  const userSegmentsWithCompletions = userSegments.map((seg) => {
    // Remove userIds from the response (internal only, not for client)
    const { userIds, ...rest } = seg;
    const compData = completionMap.get(seg.segment);
    return {
      ...rest,
      avgLessonsCompleted: compData
        ? compData.userCount > 0
          ? Math.round(compData.totalCompletions / compData.userCount)
          : 0
        : 0,
    };
  });

  return { devices, userSegments: userSegmentsWithCompletions };
};

/**
 * Fetch engagement statistics: average session duration, actions per active user,
 * total sessions, and returning user count.
 *
 * Runs 5 queries in parallel. "Returning users" are defined as users with
 * more than 1 activity event in the period.
 *
 * @param   {Date} start - Window start
 * @returns {Object} { avgSessionDuration, avgActionsPerUser, totalSessions, returningUsers }
 */
const fetchEngagementStats = async (start) => {
  const [
    avgSessionDuration,
    activeUserCount,
    totalActivity,
    totalSessions,
    returningUsers,
  ] = await Promise.all([
    Activity.aggregate([
      {
        $match: {
          actionType: "SESSION_END",
          "metadata.duration": { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          avg: { $avg: "$metadata.duration" },
          min: { $min: "$metadata.duration" },
          max: { $max: "$metadata.duration" },
        },
      },
    ]),
    User.countDocuments({ lastActive: { $gte: start } }),
    Activity.countDocuments({ timestamp: { $gte: start } }),
    Activity.countDocuments({
      actionType: "SESSION_START",
      timestamp: { $gte: start },
    }),
    Activity.aggregate([
      { $match: { timestamp: { $gte: start } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $count: "returning" },
    ]),
  ]);

  return {
    avgSessionDuration: avgSessionDuration[0]?.avg || 0,
    avgActionsPerUser:
      activeUserCount > 0 ? (totalActivity / activeUserCount).toFixed(1) : 0,
    totalSessions,
    returningUsers: returningUsers[0]?.returning || 0,
  };
};

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------
/**
 * Get platform-wide analytics (users, signups, activity trends).
 * Results are cached for 5 minutes.
 *
 * @route   GET /api/analytics/platform
 * @returns {Object} 200 - Aggregated platform metrics
 */
const getPlatformAnalytics = catchAsync(async (req, res) => {
  const {
    range = "30d",
    startDate: customStart,
    endDate: customEnd,
    groupBy = "day",
  } = req.query;

  const { start, end } = getDateRange(range, customStart, customEnd);

  // Cache
  const [
    userStats,
    contentStats,
    activityStats,
    demographicStats,
    engagementStats,
  ] = await Promise.all([
    withCache(`userStats:${start}:${end}`, () => fetchUserStats(start, end)),
    withCache(`contentStats:${start}`, () => fetchContentStats(start)),
    withCache(`activityStats:${start}:${end}:${groupBy}`, () =>
      fetchActivityStats(start, end, groupBy),
    ),
    withCache(`demographicStats:${start}`, () => fetchDemographicStats(start)),
    withCache(`engagementStats:${start}`, () => fetchEngagementStats(start)),
  ]);

  sendJsonResponse(res, 200, "Analytics data retrieved successfully.", {
    summary: {
      users: userStats,
      content: contentStats,
      engagement: engagementStats,
    },
    trends: {
      daily: activityStats.dailyActivity,
      growth: activityStats.userGrowth,
      popularContent: activityStats.contentPerformance.slice(0, 5),
      strugglingContent: activityStats.contentPerformance
        .filter((l) => l.starts > 5)
        .sort((a, b) => a.completionRate - b.completionRate)
        .slice(0, 5),
    },
    demographics: demographicStats,
    timeframe: { start, end, range },
  });
});

/**
 * Get content engagement analytics (lesson views, completions, popular modules).
 * Results are cached for 5 minutes.
 *
 * @route   GET /api/analytics/content
 * @returns {Object} 200 - Content engagement data
 */
const getContentAnalytics = catchAsync(async (req, res, next) => {
  const { contentId, contentType = "lesson" } = req.params;

  const Model = contentType === "lesson" ? Lesson : Module;
  const content = await Model.findById(contentId);

  if (!content) {
    return next(new AppError(`${contentType} not found`, 404));
  }

  const activity = await Activity.aggregate([
    {
      $match: {
        $or: [
          { "metadata.lessonId": content._id },
          { "metadata.moduleId": content._id },
        ],
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        views: {
          $sum: { $cond: [{ $eq: ["$actionType", "PAGE_VIEW"] }, 1, 0] },
        },
        starts: {
          $sum: { $cond: [{ $eq: ["$actionType", "LESSON_START"] }, 1, 0] },
        },
        completes: {
          $sum: { $cond: [{ $eq: ["$actionType", "LESSON_COMPLETE"] }, 1, 0] },
        },
        avgTimeSpent: { $avg: "$metadata.duration" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const summary = activity.reduce(
    (acc, day) => ({
      totalViews: acc.totalViews + day.views,
      totalStarts: acc.totalStarts + day.starts,
      totalCompletes: acc.totalCompletes + day.completes,
    }),
    { totalViews: 0, totalStarts: 0, totalCompletes: 0 },
  );

  sendJsonResponse(res, 200, "Content analytics retrieved", {
    content,
    activity,
    summary: {
      ...summary,
      completionRate:
        totalStarts > 0
          ? (summary.totalCompletes / summary.totalStarts) * 100
          : 0,
    },
  });
});

/**
 * Get user behavior analytics (retention, progression, segmentation).
 * Results are cached for 5 minutes.
 *
 * @route   GET /api/analytics/users
 * @returns {Object} 200 - User behavior metrics
 */
const getUserAnalytics = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const activity = await Activity.aggregate([
    { $match: { userId: user._id } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        actions: { $sum: 1 },
        lessonsCompleted: {
          $sum: { $cond: [{ $eq: ["$actionType", "LESSON_COMPLETE"] }, 1, 0] },
        },
        xpEarned: { $sum: "$metadata.xpEarned" },
        timeSpent: { $sum: "$metadata.duration" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const summary = activity.reduce(
    (acc, day) => ({
      totalActions: acc.totalActions + day.actions,
      totalLessonsCompleted: acc.totalLessonsCompleted + day.lessonsCompleted,
      totalXPEarned: acc.totalXPEarned + (day.xpEarned || 0),
      totalTimeSpent: acc.totalTimeSpent + (day.timeSpent || 0),
    }),
    {
      totalActions: 0,
      totalLessonsCompleted: 0,
      totalXPEarned: 0,
      totalTimeSpent: 0,
    },
  );

  sendJsonResponse(res, 200, "User analytics retrieved", {
    user: {
      id: user._id,
      username: user.username,
      level: user.level,
      xp: user.xp,
    },
    activity,
    summary: {
      ...summary,
      averageDailyActions:
        activity.length > 0
          ? (summary.totalActions / activity.length).toFixed(1)
          : 0,
    },
  });
});

module.exports = {
  getPlatformAnalytics,
  getContentAnalytics,
  getUserAnalytics,
  // Exported for testing
  getDateRange,
  formatRetentionCohorts,
};
