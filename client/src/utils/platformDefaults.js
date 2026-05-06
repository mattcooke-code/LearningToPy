// /client/src/utils/platformDefaults.js
/**
 * @fileoverview Platform-wide default configuration constants.
 *
 * Centralises default values for all configurable platform settings:
 * general limits, theme defaults, gamification parameters, feature flags,
 * security policies, and advanced options. Used by admin settings panels
 * and as fallback values when server-provided configuration is unavailable.
 *
 * @module utils/platformDefaults
 */

/**
 * Platform default settings object.
 *
 * Organised by settings tab for clarity. All values represent the
 * out-of-the-box defaults before any admin customisation.
 *
 * @type {{
 *   maxFileSize: number,
 *   maxAvatarSize: number,
 *   sessionTimeout: number,
 *   maxLoginAttempts: number,
 *   defaultDifficulty: string,
 *   maxLessonsPerModule: number,
 *   themeColor: string,
 *   codeTheme: string,
 *   defaultTheme: string,
 *   xpPerLevel: number,
 *   moduleXpBonus: number,
 *   streakBonusMultiplier: number,
 *   dailyStreakReward: number,
 *   weeklyChallengeBonus: number,
 *   enableLeaderboards: boolean,
 *   enableBadges: boolean,
 *   enableStreaks: boolean,
 *   enableChallenges: boolean,
 *   enableComments: boolean,
 *   allowRegistrations: boolean,
 *   maintenanceMode: boolean,
 *   previewMode: boolean,
 *   autoPublishNewContent: boolean,
 *   requireEmailVerification: boolean,
 *   requireStrongPassword: boolean,
 *   enable2FA: boolean,
 *   logIpAddresses: boolean,
 * }}
 */
export const PLATFORM_DEFAULTS = {
  // General Settings
  maxFileSize: 10, // MB
  maxAvatarSize: 2, // MB
  sessionTimeout: 60, // minutes
  maxLoginAttempts: 5,
  defaultDifficulty: "BEGINNER",
  maxLessonsPerModule: 6,

  // Theme Settings
  themeColor: "#3b82f6", // blue-500
  codeTheme: "dark",
  defaultTheme: "system",

  // Gamification Settings
  xpPerLevel: 100,
  moduleXpBonus: 500,
  streakBonusMultiplier: 1.5,
  dailyStreakReward: 50,
  weeklyChallengeBonus: 1000,

  // Feature Settings
  enableLeaderboards: true,
  enableBadges: true,
  enableStreaks: true,
  enableChallenges: true,
  enableComments: true,
  allowRegistrations: true,
  maintenanceMode: false,
  previewMode: false,
  autoPublishNewContent: false,

  // Security Settings
  requireEmailVerification: false,
  requireStrongPassword: true,
  enable2FA: false,
  logIpAddresses: true,

  // Advanced Settings
  // Note: previewMode and autoPublishNewContent are duplicated from features
};
