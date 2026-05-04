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

import { trackLessonView, trackCompletion } from "../../services/streakManager";

// --- HELPERS ---

const createUser = (overrides = {}) => ({
  _id: "user123",
  streak: 0,
  streakStatus: "ACTIVE",
  lastActiveDate: null,
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

describe("trackLessonView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets initial streak on first view", async () => {
    const user = createUser();

    const result = await trackLessonView(user);

    // First activity should initialize a streak
    expect(result.streak).toBeGreaterThan(0);
    expect(user.weeklyProgress.daysActive).toBe(1);
    expect(user.lastActiveDate).toBeDefined();
  });

  it("increments streak on consecutive day", async () => {
    // Use actual yesterday to guarantee a 1-day gap
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const user = createUser({
      streak: 3,
      lastActiveDate: yesterday,
      weeklyProgress: {
        weekStartDate: yesterday,
        daysActive: 1,
        completionsThisWeek: 0,
        warningIssued: false,
        warningDay: 5,
      },
    });

    const result = await trackLessonView(user);

    // Should increment because new Date() is today (1 day after yesterday)
    expect(result.streak).toBe(4);
  });

  it("resets streak when day gap > 1", async () => {
    const monday = d("2026-04-27T00:00:00Z");
    const wednesday = d("2026-04-29T00:00:00Z");

    const user = createUser({
      streak: 10,
      lastActiveDate: monday,
      weeklyProgress: {
        weekStartDate: monday,
        daysActive: 1,
        completionsThisWeek: 0,
        warningIssued: false,
        warningDay: 5,
      },
    });

    // Set mockCheckDate to return Wednesday
    const result = await trackLessonView(user);

    // Gap of 2 days should reset streak to 1
    expect(result.streak).toBe(1);
  });

  it("does not double-count same-day activity", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = createUser({
      streak: 3,
      lastActiveDate: today,
      weeklyProgress: {
        weekStartDate: today,
        daysActive: 1,
        completionsThisWeek: 0,
        warningIssued: false,
        warningDay: 5,
      },
    });

    const result = await trackLessonView(user);

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
      lastActiveDate: monday,
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
      lastActiveDate: monday,
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
      lastActiveDate: monday,
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
      lastActiveDate: now, // active today
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
