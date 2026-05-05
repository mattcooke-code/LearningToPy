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

  // Index activity dates by userId for O(1) lookup
  const activityByUser = {};
  for (const log of allActivity) {
    const uid = log.userId.toString();
    if (!activityByUser[uid]) activityByUser[uid] = [];
    activityByUser[uid].push(log.timestamp.toISOString().slice(0, 10));
  }

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

    const activityDates = activityByUser[user._id.toString()] || [];

    for (const week of WEEKS_TO_TRACK) {
      const boundary = new Date(user.createdAt);
      boundary.setDate(boundary.getDate() + week * 7);
      const boundaryStr = boundary.toISOString().slice(0, 10);

      if (activityDates.some((date) => date >= boundaryStr)) {
        cohorts[cohortKey][`week${week}`]++;
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
  const [
    totalLessons,
    totalModules,
    lessonsCompleted,
    totalXP,
    totalStarts,
    totalCompletes,
  ] = await Promise.all([
    Lesson.countDocuments({ isPublished: true }),
    Module.countDocuments({ isPublished: true }),
    User.aggregate([{ $unwind: "$completedLessons" }, { $count: "total" }]),
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

  return {
    totalLessons,
    totalModules,
    lessonsCompleted: lessonsCompleted[0]?.total || 0,
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
  const [dailyActivity, rawUserGrowth, contentPerformance] = await Promise.all([
    // Daily activity breakdown
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

    // User growth (cumulative computed below in JS)
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

    // Per-lesson performance ranking
    Lesson.aggregate([
      { $match: { isPublished: true } },
      {
        $lookup: {
          from: ACTIVITY_COLLECTION,
          let: { lessonId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$metadata.lessonId", "$$lessonId"] },
                actionType: "LESSON_COMPLETE",
              },
            },
            { $count: "completions" },
          ],
          as: "completionData",
        },
      },
      {
        $lookup: {
          from: ACTIVITY_COLLECTION,
          let: { lessonId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$metadata.lessonId", "$$lessonId"] },
                actionType: "LESSON_START",
              },
            },
            { $count: "starts" },
          ],
          as: "startData",
        },
      },
      {
        $lookup: {
          from: ACTIVITY_COLLECTION,
          let: { lessonId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$metadata.lessonId", "$$lessonId"] },
                "metadata.duration": { $exists: true },
              },
            },
            {
              $group: {
                _id: null,
                avgDuration: { $avg: "$metadata.duration" },
              },
            },
          ],
          as: "timeData",
        },
      },
      {
        $project: {
          title: 1,
          moduleId: 1,
          difficulty: 1,
          xpReward: 1,
          completions: {
            $ifNull: [{ $arrayElemAt: ["$completionData.completions", 0] }, 0],
          },
          starts: { $ifNull: [{ $arrayElemAt: ["$startData.starts", 0] }, 0] },
          avgTimeSpent: {
            $ifNull: [{ $arrayElemAt: ["$timeData.avgDuration", 0] }, 0],
          },
          completionRate: {
            $cond: [
              {
                $gt: [
                  { $ifNull: [{ $arrayElemAt: ["$startData.starts", 0] }, 0] },
                  0,
                ],
              },
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $ifNull: [
                          { $arrayElemAt: ["$completionData.completions", 0] },
                          0,
                        ],
                      },
                      {
                        $ifNull: [
                          { $arrayElemAt: ["$startData.starts", 0] },
                          0,
                        ],
                      },
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { completions: -1 } },
      { $limit: 20 },
    ]),
  ]);

  // Compute cumulative user growth in JS
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
          totalLessonsCompleted: { $sum: { $size: "$completedLessons" } },
        },
      },
      {
        $project: {
          segment: "$_id",
          count: 1,
          avgLevel: { $round: ["$avgLevel", 1] },
          avgXP: { $round: ["$avgXP", 0] },
          avgLessonsCompleted: {
            $cond: [
              { $gt: ["$count", 0] },
              { $divide: ["$totalLessonsCompleted", "$count"] },
              0,
            ],
          },
        },
      },
      { $sort: { avgLevel: 1 } },
    ]),
  ]);

  // Compute device percentages in JS once total is known
  const deviceTotal = rawDeviceStats.reduce((sum, d) => sum + d.count, 0);
  const devices = rawDeviceStats.map((d) => ({
    device: d._id,
    count: d.count,
    percentage:
      deviceTotal > 0 ? Math.round((d.count / deviceTotal) * 10000) / 100 : 0,
  }));

  return { devices, userSegments };
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

  const totalStarts = activity.reduce((sum, day) => sum + day.starts, 0);
  const totalCompletes = activity.reduce((sum, day) => sum + day.completes, 0);

  sendJsonResponse(res, 200, "Content analytics retrieved", {
    content,
    activity,
    summary: {
      totalViews: activity.reduce((sum, day) => sum + day.views, 0),
      totalStarts,
      totalCompletes,
      completionRate:
        totalStarts > 0 ? (totalCompletes / totalStarts) * 100 : 0,
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

  const totalActions = activity.reduce((sum, day) => sum + day.actions, 0);

  sendJsonResponse(res, 200, "User analytics retrieved", {
    user: {
      id: user._id,
      username: user.username,
      level: user.level,
      xp: user.xp,
    },
    activity,
    summary: {
      totalActions,
      totalLessonsCompleted: activity.reduce(
        (sum, day) => sum + day.lessonsCompleted,
        0,
      ),
      totalXPEarned: activity.reduce(
        (sum, day) => sum + (day.xpEarned || 0),
        0,
      ),
      totalTimeSpent: activity.reduce(
        (sum, day) => sum + (day.timeSpent || 0),
        0,
      ),
      averageDailyActions:
        activity.length > 0 ? (totalActions / activity.length).toFixed(1) : 0,
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
