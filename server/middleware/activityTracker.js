// middleware/activityTracker.js
const Activity = require("../models/ActivityLog");
const { parseDeviceInfo, anonymiseIp } = require("../utils/parseDeviceInfo");

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

const addActivityMetadata = (metadata) => {
  return (req, res, next) => {
    req.activityMetadata = { ...req.activityMetadata, ...metadata };
    next();
  };
};

module.exports = { trackActivity, addActivityMetadata };
