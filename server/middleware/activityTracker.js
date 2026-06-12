const Activity = require("../models/ActivityLog");
const { parseDeviceInfo, anonymiseIp } = require("../utils/parseDeviceInfo");

const trackActivity = (actionType) => {
  return (req, res, next) => {
    res.on("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const deviceInfo = parseDeviceInfo(req.headers);

        Activity.create({
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
        }).catch((err) => console.error("Activity tracking error:", err));
      }
    });

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
