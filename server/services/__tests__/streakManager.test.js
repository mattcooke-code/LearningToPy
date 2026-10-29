import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock checkDate to return controlled timestamps
const mockCheckDate = vi.fn((date) => {
  if (!date) return null;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
});

vi.mock("../../utils/generalUtils", () => ({
  checkDate: mockCheckDate,
}));

import {
  trackDailyActivity,
  trackCompletion,
} from "../../services/streakManager";

// --- HELPERS ---

const createUser = (overrides = {}) => ({
  _id: "user123",
  streak: 0,
  streakStatus: "ACTIVE",
  streakLastCheckedDate: null,
  lastCompletionDate: null,
  weeklyProgress: {
    weekStartDate: null,
    daysActive: 0,
    completionsThisWeek: 0,
    warningIssued: false,
    warningDay: 5,
  },
  save: vi.fn().mockResolvedValue(true),
  ...overrides,
});

// Date factory — returns a Date at midnight UTC for consistent comparisons
const d = (isoString) => new Date(isoString);

// --- TESTS ---

describe("trackDailyActivity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets initial streak on first view", async () => {
    const user = createUser();

    const result = await trackDailyActivity(user);

    // First activity should initialize a streak
    expect(result.streak).toBeGreaterThan(0);
    expect(user.weeklyProgress.daysActive).toBe(1);
    expect(user.streakLastCheckedDate).toBeDefined();
  });

  it("increments streak on consecutive day", async () => {
    // Use actual yesterday to guarantee a 1-day gap
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const user = createUser({
      streak: 3,
      streakLastCheckedDate: yesterday,
      weeklyProgress: {
        weekStartDate: yesterday,
        daysActive: 1,
        completionsThisWeek: 0,
        warningIssued: false,
        warningDay: 5,
      },
    });

    const result = await trackDailyActivity(user);

    // Should increment because new Date() is today (1 day after yesterday)
    expect(result.streak).toBe(4);
  });

  it("resets streak when day gap > 1", async () => {
    const monday = d("2026-04-27T00:00:00Z");
    const wednesday = d("2026-04-29T00:00:00Z");

    const user = createUser({
      streak: 10,
      streakLastCheckedDate: monday,
      weeklyProgress: {
        weekStartDate: monday,
        daysActive: 1,
        completionsThisWeek: 0,
        warningIssued: false,
        warningDay: 5,
      },
    });

    // Set mockCheckDate to return Wednesday
    const result = await trackDailyActivity(user);

    // Gap of 2 days should reset streak to 1
    expect(result.streak).toBe(1);
  });

  it("does not double-count same-day activity", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = createUser({
      streak: 3,
      streakLastCheckedDate: today,
      weeklyProgress: {
        weekStartDate: today,
        daysActive: 1,
        completionsThisWeek: 0,
        warningIssued: false,
        warningDay: 5,
      },
    });

    const result = await trackDailyActivity(user);

    expect(user.weeklyProgress.daysActive).toBe(1); // unchanged
    expect(result.streak).toBe(3); // unchanged
  });
});

describe("trackCompletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("increments completionsThisWeek on new completion", async () => {
    const monday = d("2026-04-27T00:00:00Z");
    const tuesday = d("2026-04-28T00:00:00Z");

    const user = createUser({
      streak: 3,
      streakLastCheckedDate: monday,
      weeklyProgress: {
        weekStartDate: monday,
        daysActive: 1,
        completionsThisWeek: 0,
        warningIssued: false,
        warningDay: 5,
      },
    });

    const result = await trackCompletion(user);

    expect(user.weeklyProgress.completionsThisWeek).toBe(1);
  });

  it("recovers from WARNING to ACTIVE on completion", async () => {
    const monday = d("2026-04-27T00:00:00Z");

    const user = createUser({
      streak: 5,
      streakLastCheckedDate: monday,
      streakStatus: "WARNING",
      weeklyProgress: {
        weekStartDate: monday,
        daysActive: 1,
        completionsThisWeek: 0,
        warningIssued: true,
        warningDay: 5,
      },
    });

    const result = await trackCompletion(user);

    expect(result.streakStatus).toBe("ACTIVE");
    expect(user.weeklyProgress.warningIssued).toBe(false);
  });

  it("recovers from AT_RISK to ACTIVE on completion", async () => {
    const monday = d("2026-04-27T00:00:00Z");

    const user = createUser({
      streak: 5,
      streakLastCheckedDate: monday,
      streakStatus: "AT_RISK",
      weeklyProgress: {
        weekStartDate: monday,
        daysActive: 1,
        completionsThisWeek: 0,
        warningIssued: false,
        warningDay: 5,
      },
    });

    const result = await trackCompletion(user);

    expect(result.streakStatus).toBe("ACTIVE");
  });

  it("does not double-count multiple completions on same day", async () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const user = createUser({
      streak: 3,
      streakLastCheckedDate: now, // active today
      lastCompletionDate: now, // already completed today
      weeklyProgress: {
        weekStartDate: now, // current week started today
        daysActive: 1,
        completionsThisWeek: 1,
        warningIssued: false,
        warningDay: 5,
      },
    });

    await trackCompletion(user);

    // Should NOT increment — already completed today
    expect(user.weeklyProgress.completionsThisWeek).toBe(1);
  });
});
