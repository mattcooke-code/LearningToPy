// auditService.js
const AdminLog = require("../models/AdminLog");
const { anonymiseIp } = require("../utils/parseDeviceInfo");

/**
 * Create an audit log entry for admin actions.
 *
 * Anonymises the actor's IP address for GDPR/data-protection compliance.
 * Logging failures are caught silently — they never fail the request.
 *
 * @param {Object}   actor       - { id, ip, userAgent }
 * @param {string}   action      - Action type (e.g. "USER_MADE_ADMIN", "LESSON_DELETED")
 * @param {string}   targetType  - "USER" | "LESSON" | "MODULE" | "FLAG" | "SETTINGS"
 * @param {string}   targetId    - ID of the affected resource
 * @param {Object}   changes     - { old, new } diff of the change
 * @param {string}   [reason]    - Human-readable reason for the action
 * @returns {Promise<void>}
 */
const createAdminLog = async (
  actor,
  action,
  targetType,
  targetId,
  changes,
  reason,
) => {
  try {
    const anonymizedIp = anonymiseIp(actor?.ip);

    await AdminLog.create({
      adminId: actor?.id,
      action,
      targetType,
      targetId,
      changes,
      reason: reason || "",
      ipAddress: anonymizedIp,
      userAgent: actor?.userAgent,
    });
  } catch (logError) {
    console.error("Failed to create admin log:", logError);
  }
};

/**
 * Build a plain `actor` object from an Express request.
 * Keeps `req` knowledge in the HTTP layer only.
 *
 * @param {Object} req - Express request object
 * @returns {Object} { id, ip, userAgent }
 */
const actorFromRequest = (req) => ({
  id: req.userId,
  ip: req.ip || req.connection?.remoteAddress,
  userAgent: req.headers?.["user-agent"],
});

module.exports = { createAdminLog, actorFromRequest };
