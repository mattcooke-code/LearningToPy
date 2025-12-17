// platformDefaults.js

export const PLATFORM_DEFAULTS = {
  // Theme Settings
  themeColor: "#3b82f6",
  codeTheme: "dark",
  defaultTheme: "system",

  // Gamification Constants
  xpPerLevel: 100,
  moduleXpBonus: 500,
  streakBonusMultiplier: 1.5,
  dailyStreakReward: 50,
  weeklyChallengeBonus: 1000,

  // Platform Settings
  maxFileSize: 10, //MB
  maxAvatarSize: 2, //MB
  sessionTimeout: 60,
  maxLoginAttempts: 5,

  // Feature Flags
  enableLeaderboards: true,
  enableBadges: true,
  enableStreaks: true,
  enableChallenges: true,
  enableComments: true,
  maintenanceMode: false,
  allowRegistrations: true,

  // Content Settings
  defaultDifficulty: "beginner",
  maxLessonsPerModule: 6,
  previewMode: false,
  autoPublishNewContent: false,

  // Security Settings
  requireEmailVerification: false,
  requireStrongPassword: true,
  enable2FA: false,
  logIpAddresses: true,
};
