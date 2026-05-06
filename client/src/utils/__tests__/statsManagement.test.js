import { describe, it, expect } from "vitest";
import {
  calculateContentStats,
  calculateModuleEditorStats,
  calculateUserDashboardStats,
  calculateAdminDashboardStats,
} from "../statsManagement";

// ============================================================================
// calculateContentStats
// ============================================================================

describe("calculateContentStats", () => {
  it("separates lessons and modules from mixed content", () => {
    const content = [
      { type: "lesson", isPublished: true },
      { type: "module", isPublished: false },
      { type: "lesson", isPublished: false },
    ];

    const result = calculateContentStats(content);

    expect(result.totalLessons).toBe(2);
    expect(result.totalModules).toBe(1);
    expect(result.publishedLessons).toBe(1);
    expect(result.publishedModules).toBe(0);
    expect(result.draftLessons).toBe(1);
    expect(result.draftModules).toBe(1);
  });

  it("returns zeros for empty array", () => {
    const result = calculateContentStats([]);

    expect(result).toEqual({
      totalLessons: 0,
      totalModules: 0,
      publishedLessons: 0,
      publishedModules: 0,
      draftLessons: 0,
      draftModules: 0,
    });
  });

  it("counts only published items correctly", () => {
    const content = [
      { type: "lesson", isPublished: true },
      { type: "lesson", isPublished: true },
      { type: "module", isPublished: true },
      { type: "module", isPublished: true },
    ];

    const result = calculateContentStats(content);
    expect(result.publishedLessons).toBe(2);
    expect(result.publishedModules).toBe(2);
    expect(result.draftLessons).toBe(0);
    expect(result.draftModules).toBe(0);
  });

  it("handles content with all unpublished items", () => {
    const content = [
      { type: "lesson", isPublished: false },
      { type: "module", isPublished: false },
    ];

    const result = calculateContentStats(content);
    expect(result.publishedLessons).toBe(0);
    expect(result.publishedModules).toBe(0);
    expect(result.draftLessons).toBe(1);
    expect(result.draftModules).toBe(1);
  });
});

// ============================================================================
// calculateModuleEditorStats
// ============================================================================

describe("calculateModuleEditorStats", () => {
  it("sums XP from lessons and adds bonus", () => {
    const lessons = [{ xpReward: 100 }, { xpReward: 200 }, { xpReward: 50 }];

    const result = calculateModuleEditorStats(lessons, 500);

    expect(result.totalXp).toBe(850); // 350 + 500
    expect(result.count).toBe(3);
    expect(result.bonusXp).toBe(500);
  });

  it("sums estimatedTime with default of 15", () => {
    const lessons = [
      { estimatedTime: 10 },
      { estimatedTime: 20 },
      {}, // no estimatedTime — defaults to 15
    ];

    const result = calculateModuleEditorStats(lessons, 0);
    expect(result.totalTime).toBe(45); // 10 + 20 + 15
  });

  it("handles string bonus (coerces to number)", () => {
    const result = calculateModuleEditorStats([], "300");
    expect(result.bonusXp).toBe(300);
    expect(result.totalXp).toBe(300);
  });

  it("handles invalid bonus (NaN → 0)", () => {
    const result = calculateModuleEditorStats([], "abc");
    expect(result.bonusXp).toBe(0);
    expect(result.totalXp).toBe(0);
  });

  it("returns zeros for empty lessons array", () => {
    const result = calculateModuleEditorStats([], 0);
    expect(result).toEqual({
      totalXp: 0,
      totalTime: 0,
      count: 0,
      bonusXp: 0,
    });
  });

  it("handles lessons with missing xpReward", () => {
    const lessons = [{ xpReward: 100 }, {}]; // second lesson has no xp
    const result = calculateModuleEditorStats(lessons, 50);
    expect(result.totalXp).toBe(150); // 100 + 0 + 50
  });
});

// ============================================================================
// calculateUserDashboardStats
// ============================================================================

describe("calculateUserDashboardStats", () => {
  it("returns 6 stat cards for a complete user", () => {
    const user = {
      xp: 1500,
      level: 5,
      streak: 12,
      badges: [{ id: "a" }, { id: "b" }, { id: "c" }],
      completedLessons: ["l1", "l2", "l3", "l4"],
      completedModules: ["m1", "m2"],
    };

    const result = calculateUserDashboardStats(user);

    expect(result).toHaveLength(6);
    expect(result[0].label).toBe("Total XP");
    expect(result[0].value).toBe("1,500");
    expect(result[0].color).toBe("yellow");

    expect(result[1].label).toBe("Level");
    expect(result[1].value).toBe(5);

    expect(result[2].label).toBe("Streak");
    expect(result[2].value).toBe(12);

    expect(result[3].label).toBe("Badges");
    expect(result[3].value).toBe(3);

    expect(result[4].label).toBe("Lessons");
    expect(result[4].value).toBe(4);

    expect(result[5].label).toBe("Modules");
    expect(result[5].value).toBe(2);
  });

  it("returns safe defaults for undefined user", () => {
    const result = calculateUserDashboardStats(undefined);

    expect(result[0].value).toBe("0");
    expect(result[1].value).toBe(1);
    expect(result[2].value).toBe(0);
    expect(result[3].value).toBe(0);
    expect(result[4].value).toBe(0);
    expect(result[5].value).toBe(0);
  });

  it("returns safe defaults for empty object", () => {
    const result = calculateUserDashboardStats({});

    expect(result[0].value).toBe("0");
    expect(result[1].value).toBe(1);
  });

  it("each card has the expected shape", () => {
    const result = calculateUserDashboardStats({});
    result.forEach((card) => {
      expect(card).toHaveProperty("icon");
      expect(card).toHaveProperty("label");
      expect(card).toHaveProperty("value");
      expect(card).toHaveProperty("color");
    });
  });
});

// ============================================================================
// calculateAdminDashboardStats
// ============================================================================

describe("calculateAdminDashboardStats", () => {
  it("calculates all stats from provided data", () => {
    const statsData = {
      totalUsers: 120,
      activeUsers: 45,
      totalLessons: 60,
      publishedLessons: 48,
      flaggedCount: 3,
    };

    const result = calculateAdminDashboardStats(statsData);

    expect(result.totalUsers).toBe(120);
    expect(result.activeUsers).toBe(45);
    expect(result.totalLessons).toBe(60);
    expect(result.publishedLessons).toBe(48);
    expect(result.flaggedCount).toBe(3);
    expect(result.publishedPercentage).toBe(80); // 48/60 = 80%
  });

  it("returns zeros when statsData is undefined", () => {
    const result = calculateAdminDashboardStats(undefined);

    expect(result.totalUsers).toBe(0);
    expect(result.activeUsers).toBe(0);
    expect(result.totalLessons).toBe(0);
    expect(result.publishedLessons).toBe(0);
    expect(result.flaggedCount).toBe(0);
    expect(result.publishedPercentage).toBe(0);
  });

  it("handles pendingFlags as fallback for flaggedCount", () => {
    const result = calculateAdminDashboardStats({ pendingFlags: 7 });

    expect(result.flaggedCount).toBe(7);
  });

  it("prefers flaggedCount over pendingFlags when both present", () => {
    const result = calculateAdminDashboardStats({
      flaggedCount: 5,
      pendingFlags: 10,
    });

    expect(result.flaggedCount).toBe(5);
  });

  it("returns 0% published when totalLessons is 0", () => {
    const result = calculateAdminDashboardStats({
      totalLessons: 0,
      publishedLessons: 0,
    });

    expect(result.publishedPercentage).toBe(0);
  });

  it("rounds published percentage", () => {
    const result = calculateAdminDashboardStats({
      totalLessons: 3,
      publishedLessons: 1,
    });

    expect(result.publishedPercentage).toBe(33); // 1/3 = 33.33 → 33
  });

  it("returns 100% when all lessons published", () => {
    const result = calculateAdminDashboardStats({
      totalLessons: 10,
      publishedLessons: 10,
    });

    expect(result.publishedPercentage).toBe(100);
  });
});
