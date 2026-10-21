// privacyUtils.js

/**
 * Standard privacy notice content returned during registration.
 */
// Privacy notice (GDPR transparency)
const PRIVACY_NOTICE = {
  dataCollected: [
    "Username",
    "Email address",
    "Learning progress (XP, levels, completed lessons)",
    "Quiz and exercise results",
    "Activity timestamps",
  ],
  dataRetention:
    "Account data is retained until you delete your account. " +
    "Activity logs are automatically deleted after 90 days.",
  yourRights: [
    "Access your data (Settings > Export Data)",
    "Correct inaccurate data",
    "Delete your account and all data",
    "Object to data processing",
    "Data portability",
  ],
  contactEmail: "learning2py@gmail.com",
  lastUpdated: "2026-05-14",
};

module.exports = { PRIVACY_NOTICE };
