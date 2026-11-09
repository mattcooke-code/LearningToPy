// adminConstants.js

/**
 * Default platform settings.
 *
 * NOTE: These are currently returned by `getSettings` and echoed (but not
 * persisted) by `updateSettings`. Persisting settings to a Settings collection
 * is a planned follow-up — see adminService TODO.
 */
const DEFAULT_SETTINGS = Object.freeze({
  themeColor: "#3b82f6",
  codeTheme: "dark",
  defaultTheme: "system",
  xpPerLevel: 100,
  moduleXpBonus: 500,
  streakBonusMultiplier: 1.5,
  dailyStreakReward: 50,
  weeklyChallengeBonus: 1000,
  maxFileSize: 10,
  maxAvatarSize: 2,
  sessionTimeout: 60,
  maxLoginAttempts: 5,
  enableLeaderboards: true,
  enableBadges: true,
  enableStreaks: true,
  enableChallenges: true,
  enableComments: true,
  maintenanceMode: false,
  allowRegistrations: true,
  defaultDifficulty: "BEGINNER",
  maxLessonsPerModule: 20,
  previewMode: false,
  autoPublishNewContent: false,
  requireEmailVerification: false,
  requireStrongPassword: true,
  enable2FA: false,
  logIpAddresses: true,
});

module.exports = {
  DEFAULT_SETTINGS,
};
