import { describe, it, expect } from "vitest";
import { PLATFORM_DEFAULTS } from "../platformDefaults";

describe("PLATFORM_DEFAULTS", () => {
  it("is a frozen-like object with all expected top-level keys", () => {
    const keys = Object.keys(PLATFORM_DEFAULTS);
    expect(keys).toContain("maxFileSize");
    expect(keys).toContain("maxAvatarSize");
    expect(keys).toContain("sessionTimeout");
    expect(keys).toContain("maxLoginAttempts");
    expect(keys).toContain("defaultDifficulty");
    expect(keys).toContain("maxLessonsPerModule");
    expect(keys).toContain("themeColor");
    expect(keys).toContain("codeTheme");
    expect(keys).toContain("defaultTheme");
    expect(keys).toContain("xpPerLevel");
    expect(keys).toContain("moduleXpBonus");
    expect(keys).toContain("streakBonusMultiplier");
    expect(keys).toContain("dailyStreakReward");
    expect(keys).toContain("weeklyChallengeBonus");
    expect(keys).toContain("enableLeaderboards");
    expect(keys).toContain("enableBadges");
    expect(keys).toContain("enableStreaks");
    expect(keys).toContain("enableChallenges");
    expect(keys).toContain("enableComments");
    expect(keys).toContain("allowRegistrations");
    expect(keys).toContain("maintenanceMode");
    expect(keys).toContain("previewMode");
    expect(keys).toContain("autoPublishNewContent");
    expect(keys).toContain("requireEmailVerification");
    expect(keys).toContain("requireStrongPassword");
    expect(keys).toContain("enable2FA");
    expect(keys).toContain("logIpAddresses");
  });

  it("has correct default values for general settings", () => {
    expect(PLATFORM_DEFAULTS.maxFileSize).toBe(10);
    expect(PLATFORM_DEFAULTS.maxAvatarSize).toBe(2);
    expect(PLATFORM_DEFAULTS.sessionTimeout).toBe(60);
    expect(PLATFORM_DEFAULTS.maxLoginAttempts).toBe(5);
    expect(PLATFORM_DEFAULTS.defaultDifficulty).toBe("BEGINNER");
    expect(PLATFORM_DEFAULTS.maxLessonsPerModule).toBe(6);
  });

  it("has correct default values for theme settings", () => {
    expect(PLATFORM_DEFAULTS.themeColor).toBe("#3b82f6");
    expect(PLATFORM_DEFAULTS.codeTheme).toBe("dark");
    expect(PLATFORM_DEFAULTS.defaultTheme).toBe("system");
  });

  it("has correct default values for gamification settings", () => {
    expect(PLATFORM_DEFAULTS.xpPerLevel).toBe(100);
    expect(PLATFORM_DEFAULTS.moduleXpBonus).toBe(500);
    expect(PLATFORM_DEFAULTS.streakBonusMultiplier).toBe(1.5);
    expect(PLATFORM_DEFAULTS.dailyStreakReward).toBe(50);
    expect(PLATFORM_DEFAULTS.weeklyChallengeBonus).toBe(1000);
  });

  it("has correct default values for feature flags", () => {
    expect(PLATFORM_DEFAULTS.enableLeaderboards).toBe(true);
    expect(PLATFORM_DEFAULTS.enableBadges).toBe(true);
    expect(PLATFORM_DEFAULTS.enableStreaks).toBe(true);
    expect(PLATFORM_DEFAULTS.enableChallenges).toBe(true);
    expect(PLATFORM_DEFAULTS.enableComments).toBe(true);
    expect(PLATFORM_DEFAULTS.allowRegistrations).toBe(true);
    expect(PLATFORM_DEFAULTS.maintenanceMode).toBe(false);
    expect(PLATFORM_DEFAULTS.previewMode).toBe(false);
    expect(PLATFORM_DEFAULTS.autoPublishNewContent).toBe(false);
  });

  it("has correct default values for security settings", () => {
    expect(PLATFORM_DEFAULTS.requireEmailVerification).toBe(false);
    expect(PLATFORM_DEFAULTS.requireStrongPassword).toBe(true);
    expect(PLATFORM_DEFAULTS.enable2FA).toBe(false);
    expect(PLATFORM_DEFAULTS.logIpAddresses).toBe(true);
  });

  it("has exactly 27 keys (catches accidental additions/deletions)", () => {
    expect(Object.keys(PLATFORM_DEFAULTS)).toHaveLength(27);
  });
});
