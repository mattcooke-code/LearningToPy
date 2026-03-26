// constants/settingsConfigs.js
export const SETTINGS_CONFIGS = {
  general: [
    {
      key: "maxAvatarSize",
      label: "Max Avatar Size (MB)",
      type: "number",
      options: { min: 0.1, max: 10, step: 0.1 },
      description: "Maximum avatar image size",
    },

    {
      key: "defaultDifficulty",
      label: "Default Difficulty",
      type: "select",
      options: {
        items: [
          { value: "beginner", label: "Beginner" },
          { value: "intermediate", label: "Intermediate" },
          { value: "advanced", label: "Advanced" },
        ],
      },
      description: "Default difficulty for new content",
    },
    {
      key: "maxLessonsPerModule",
      label: "Max Lessons Per Module",
      type: "number",
      options: { min: 1, max: 50 },
      description: "Maximum lessons allowed in a module",
    },
  ],
  theme: [
    {
      key: "uiTheme",
      label: "Site Theme",
      type: "select",
      options: {
        items: [
          { value: "light", label: "Light Mode" },
          { value: "dark", label: "Dark Mode" },
          { value: "system", label: "Follow System Preference" },
        ],
      },
      description: "Choose your preferred site appearance",
    },
    {
      key: "themeColor",
      label: "Accent Color",
      type: "color",
      description: "Primary accent color for buttons and highlights",
    },
    {
      key: "codeTheme",
      label: "Code Editor Theme",
      type: "select",
      options: {
        items: [
          { value: "dark", label: "Dark Theme" },
          { value: "light", label: "Light Theme" },
        ],
      },
      description: "Theme for the Python code editor",
    },
  ],
  gamification: [
    {
      key: "xpPerLevel",
      label: "XP Per Level",
      type: "number",
      options: { min: 10, max: 1000 },
      description: "Base XP required to level up",
    },
    {
      key: "moduleXpBonus",
      label: "Module Completion Bonus",
      type: "number",
      options: { min: 0, max: 5000 },
      description: "Bonus XP for completing a module",
    },
    {
      key: "streakBonusMultiplier",
      label: "Streak Bonus Multiplier",
      type: "number",
      options: { min: 1, max: 3, step: 0.1 },
      description: "Multiplier for consecutive day streaks",
    },
    {
      key: "dailyStreakReward",
      label: "Daily Streak Reward",
      type: "number",
      options: { min: 0, max: 1000 },
      description: "XP reward for maintaining daily streak",
    },
    {
      key: "weeklyChallengeBonus",
      label: "Weekly Challenge Bonus",
      type: "number",
      options: { min: 0, max: 5000 },
      description: "Bonus XP for weekly challenges",
    },
  ],
  features: [
    {
      key: "enableLeaderboards",
      label: "Enable Leaderboards",
      type: "toggle",
      description: "Show global and module leaderboards",
    },
    {
      key: "enableBadges",
      label: "Enable Badges",
      type: "toggle",
      description: "Award badges for achievements",
    },
    {
      key: "enableStreaks",
      label: "Enable Streaks",
      type: "toggle",
      description: "Track and reward daily learning streaks",
    },
    {
      key: "enableChallenges",
      label: "Enable Challenges",
      type: "toggle",
      description: "Weekly and special challenges",
    },
    {
      key: "enableComments",
      label: "Enable Comments",
      type: "toggle",
      description: "Allow comments on lessons",
    },
    {
      key: "allowRegistrations",
      label: "Allow New Registrations",
      type: "toggle",
      description: "Allow new users to sign up",
    },
    {
      key: "maintenanceMode",
      label: "Maintenance Mode",
      type: "toggle",
      description: "Put platform in read-only mode",
    },
    {
      key: "previewMode",
      label: "Preview Mode",
      type: "toggle",
      description: "Allow preview of unpublished content",
    },
    {
      key: "autoPublishNewContent",
      label: "Auto-Publish New Content",
      type: "toggle",
      description: "Automatically publish new lessons/modules",
    },
  ],
  security: [
    {
      key: "requireEmailVerification",
      label: "Require Email Verification",
      type: "toggle",
      description: "Users must verify email before using platform",
    },
    {
      key: "requireStrongPassword",
      label: "Require Strong Password",
      type: "toggle",
      description: "Enforce password complexity rules",
    },
    {
      key: "enable2FA",
      label: "Enable Two-Factor Authentication",
      type: "toggle",
      description: "Allow users to enable 2FA",
    },
  ],
  advanced: [
    {
      key: "logIpAddresses",
      label: "Log IP Addresses",
      type: "toggle",
      description: "Log user IPs for security audit",
    },
    {
      key: "sessionTimeout",
      label: "Session Timeout (minutes)",
      type: "number",
      options: { min: 5, max: 1440 },
      description: "Inactive session timeout duration",
    },
    {
      key: "maxLoginAttempts",
      label: "Max Login Attempts",
      type: "number",
      options: { min: 1, max: 10 },
      description: "Failed login attempts before lockout",
    },
    {
      key: "maxFileSize",
      label: "Max File Size (MB)",
      type: "number",
      options: { min: 1, max: 100 },
      description: "Maximum file size for exercise submissions",
    },
  ],
};

export const ADMIN_TABS = [
  { id: "general", label: "General", icon: "Globe" },
  { id: "theme", label: "Theming", icon: "Palette" },
  { id: "gamification", label: "Gamification", icon: "Trophy" },
  { id: "features", label: "Features", icon: "Zap" },
  { id: "security", label: "Security", icon: "Shield" },
  { id: "advanced", label: "Advanced", icon: "Code" },
];
