// controllers/analyticsController.js
/**
 * Analytics Controller — thin HTTP layer.
 *
 * Uses `analyticsCache` for read-through caching of expensive aggregation
 * queries. All routes require admin authentication.
 *
 * @middleware adminOnly - Required on all routes
 */
const { withCache } = require("../utils/analyticsCache");
const catchAsync = require("../utils/catchAsync");
const { sendJsonResponse } = require("../utils/responseHelpers");
const analyticsService = require("../services/analyticsService");
const analyticsConstants = require("../constants/analyticsConstants");

/**
 * Get platform-wide analytics (users, signups, activity trends).
 * Results are cached for 5 minutes.
 *
 * @route   GET /api/analytics/platform
 * @returns {Object} 200 - Aggregated platform metrics
 */
const getPlatformAnalytics = catchAsync(async (req, res) => {
  const {
    range = analyticsConstants.DEFAULT_RANGE,
    startDate: customStart,
    endDate: customEnd,
    groupBy = analyticsConstants.DEFAULT_GROUP_BY,
  } = req.query;

  const rangeInfo = analyticsService.getDateRange(
    range,
    customStart,
    customEnd,
  );
  const { start, end } = rangeInfo;

  // Cache keys are normalised by range granularity (see buildCacheKey),
  // so repeated requests within the same bucket share entries.
  const [
    userStats,
    contentStats,
    activityStats,
    demographicStats,
    engagementStats,
  ] = await Promise.all([
    withCache(analyticsService.buildCacheKey("userStats", rangeInfo), () =>
      analyticsService.fetchUserStats(start, end),
    ),
    withCache(analyticsService.buildCacheKey("contentStats", rangeInfo), () =>
      analyticsService.fetchContentStats(start),
    ),
    withCache(
      analyticsService.buildCacheKey("activityStats", rangeInfo, groupBy),
      () => analyticsService.fetchActivityStats(start, end, groupBy),
    ),
    withCache(
      analyticsService.buildCacheKey("demographicStats", rangeInfo),
      () => analyticsService.fetchDemographicStats(start),
    ),
    withCache(
      analyticsService.buildCacheKey("engagementStats", rangeInfo),
      () => analyticsService.fetchEngagementStats(start),
    ),
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
const getContentAnalytics = catchAsync(async (req, res) => {
  const { contentId, contentType = "lesson" } = req.params;
  const result = await analyticsService.getContentAnalytics(
    contentId,
    contentType,
  );
  sendJsonResponse(res, 200, "Content analytics retrieved", result);
});

/**
 * Get user behavior analytics (retention, progression, segmentation).
 * Results are cached for 5 minutes.
 *
 * @route   GET /api/analytics/users
 * @returns {Object} 200 - User behavior metrics
 */
const getUserAnalytics = catchAsync(async (req, res) => {
  const result = await analyticsService.getUserAnalytics(req.params.userId);
  sendJsonResponse(res, 200, "User analytics retrieved", result);
});

module.exports = {
  getPlatformAnalytics,
  getContentAnalytics,
  getUserAnalytics,
};
