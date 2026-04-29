// platformDefaults.js
export const PLATFORM_DEFAULTS = {
  // General Settings (from general tab)
  maxFileSize: 10, // MB
  maxAvatarSize: 2, // MB
  sessionTimeout: 60, // minutes
  maxLoginAttempts: 5,
  defaultDifficulty: "BEGINNER",
  maxLessonsPerModule: 6,

  // Theme Settings (from theme tab)
  themeColor: "#3b82f6", // blue-500
  codeTheme: "dark",
  defaultTheme: "system",

  // Gamification Settings (from gamification tab)
  xpPerLevel: 100,
  moduleXpBonus: 500,
  streakBonusMultiplier: 1.5,
  dailyStreakReward: 50,
  weeklyChallengeBonus: 1000,

  // Feature Settings (from features tab)
  enableLeaderboards: true,
  enableBadges: true,
  enableStreaks: true,
  enableChallenges: true,
  enableComments: true,
  allowRegistrations: true,
  maintenanceMode: false,
  previewMode: false,
  autoPublishNewContent: false,

  // Security Settings (from security tab)
  requireEmailVerification: false,
  requireStrongPassword: true,
  enable2FA: false,
  logIpAddresses: true,

  // Advanced Settings (from advanced tab)
  // Note: previewMode and autoPublishNewContent are duplicates from features
  // They should be the same setting, not separate ones
};
