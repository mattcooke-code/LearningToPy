// middleware/activityTracker.js
const Activity = require("../models/ActivityLog");
const { parseDeviceInfo, anonymiseIp } = require("../utils/parseDeviceInfo");

/**
 * Activity tracking middleware — records user actions to the ActivityLog collection.
 *
 * Wraps `res.json` to fire-and-forget an ActivityLog entry on successful responses
 * (2xx status codes). Tracking failures are silent — they never block the response.
 *
 * **Captured data:** userId, actionType, sessionId, lesson/module IDs, device info,
 * anonymised IP address, timestamp.
 *
 * @param   {string} actionType - Action identifier (e.g., "LESSON_START", "PAGE_VIEW")
 * @returns {Function} Express middleware
 *
 * @example
 *   router.get('/lessons/:id', trackActivity('LESSON_START'), getLesson);
 */
const trackActivity = (actionType) => {
  return async (req, res, next) => {
    const originalJson = res.json;

    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const deviceInfo = parseDeviceInfo(req.headers);

        const activityData = {
          userId: req.user?._id || req.userId,
          actionType,
          sessionId: req.session?.id || req.headers["x-session-id"],
          metadata: {
            lessonId: req.params.lessonId || req.body.lessonId,
            moduleId: req.params.moduleId || req.body.moduleId,
            ...req.activityMetadata,
            deviceInfo,
          },
          ipAddress: anonymiseIp(req.ip),
          timestamp: new Date(),
        };

        Activity.create(activityData).catch((err) =>
          console.error("Activity tracking error:", err),
        );
      }

      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Attach arbitrary metadata to the request for the activity tracker.
 * Merged into `req.activityMetadata` and included in the ActivityLog entry.
 *
 * @param   {Object} metadata - Key-value pairs to attach
 * @returns {Function} Express middleware
 *
 * @example
 *   router.post('/submit', addActivityMetadata({ challengeGroup: 'algorithms' }), submitLesson);
 */
const addActivityMetadata = (metadata) => {
  return (req, res, next) => {
    req.activityMetadata = { ...req.activityMetadata, ...metadata };
    next();
  };
};

module.exports = { trackActivity, addActivityMetadata };
