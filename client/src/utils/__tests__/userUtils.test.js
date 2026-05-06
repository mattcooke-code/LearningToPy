import { describe, it, expect } from "vitest";
import { normalizeUserData } from "../userUtils";

describe("normalizeUserData", () => {
  // ---- Standard user object ----
  it("normalises a standard user object", () => {
    const raw = {
      _id: "user123",
      username: "alice",
      email: "alice@example.com",
      level: 5,
      xp: 450,
      streak: 7,
      badges: [{ id: "first-lesson" }],
      completedLessons: ["lesson1", "lesson2"],
      completedModules: ["module1"],
      stats: { timeSpent: 3600 },
      privacySettings: { showProfile: true },
      lastActiveDate: "2026-05-01",
      totalLearningTime: 7200,
      createdAt: "2026-01-15",
      isAdmin: false,
      isBlocked: false,
    };

    const result = normalizeUserData(raw);

    expect(result._id).toBe("user123");
    expect(result.username).toBe("alice");
    expect(result.email).toBe("alice@example.com");
    expect(result.level).toBe(5);
    expect(result.xp).toBe(450);
    expect(result.streak).toBe(7);
    expect(result.badges).toEqual([{ id: "first-lesson" }]);
    expect(result.completedLessons).toEqual(["lesson1", "lesson2"]);
    expect(result.completedModules).toEqual(["module1"]);
    expect(result.stats).toEqual({ timeSpent: 3600 });
    expect(result.privacySettings).toEqual({ showProfile: true });
    expect(result.lastActiveDate).toBe("2026-05-01");
    expect(result.totalLearningTime).toBe(7200);
    expect(result.createdAt).toBe("2026-01-15");
    expect(result.isAdmin).toBe(false);
    expect(result.isBlocked).toBe(false);
  });

  // ---- Wrapped login/register response ----
  it("unwraps a success response format", () => {
    const raw = {
      success: true,
      id: "user456",
      username: "bob",
      email: "bob@example.com",
      level: 3,
      xp: 250,
    };

    const result = normalizeUserData(raw);

    expect(result._id).toBe("user456");
    expect(result.username).toBe("bob");
    expect(result.level).toBe(3);
    expect(result.xp).toBe(250);
  });

  // ---- Fallback user when raw is a wrapped response without expected fields ----
  it("uses fallbackUser when raw has no identifying fields", () => {
    const raw = { success: true, id: "new" }; // has id, so it IS used
    const fallback = {
      _id: "old123",
      username: "oldname",
      email: "old@example.com",
      level: 10,
    };

    const result = normalizeUserData(raw, fallback);

    // raw has id, so raw is the source
    expect(result._id).toBe("new");
    expect(result.username).toBe(""); // raw has no username
  });

  it("uses fallbackUser when raw has no _id, id, or username", () => {
    const raw = { success: true }; // no id, no _id, no username
    const fallback = { _id: "fb", username: "fallback", level: 10 };

    const result = normalizeUserData(raw, fallback);
    expect(result._id).toBe("fb");
    expect(result.level).toBe(10);
  });

  // ---- Alternative key names ----
  it("uses currentLevel when level is missing", () => {
    const raw = { _id: "test", currentLevel: 7 };
    expect(normalizeUserData(raw).level).toBe(7);
  });

  it("uses totalXP when xp is missing", () => {
    const raw = { _id: "test", totalXP: 999 };
    expect(normalizeUserData(raw).xp).toBe(999);
  });

  it("uses lastActive when lastActiveDate is missing", () => {
    const raw = { _id: "test", lastActive: "2026-04-20" };
    expect(normalizeUserData(raw).lastActiveDate).toBe("2026-04-20");
  });

  it("uses totalSessionTime when totalLearningTime is missing", () => {
    const raw = { _id: "test", totalSessionTime: 5400 };
    expect(normalizeUserData(raw).totalLearningTime).toBe(5400);
  });

  // ---- Defaults for missing fields ----
  it("returns safe defaults for an empty object", () => {
    const result = normalizeUserData({});

    expect(result._id).toBe("");
    expect(result.username).toBe("");
    expect(result.email).toBe("");
    expect(result.level).toBe(1);
    expect(result.xp).toBe(0);
    expect(result.streak).toBe(0);
    expect(result.badges).toEqual([]);
    expect(result.completedLessons).toEqual([]);
    expect(result.completedModules).toEqual([]);
    expect(result.stats).toEqual({});
    expect(result.privacySettings).toEqual({});
    expect(result.lastActiveDate).toBeNull();
    expect(result.totalLearningTime).toBe(0);
    expect(result.createdAt).toBeNull();
    expect(result.isAdmin).toBe(false);
    expect(result.isBlocked).toBe(false);
  });

  it("returns safe defaults when raw is undefined", () => {
    const result = normalizeUserData(undefined);

    expect(result.level).toBe(1);
    expect(result.xp).toBe(0);
    expect(result.isAdmin).toBe(false);
    expect(result.badges).toEqual([]);
  });

  // ---- Boolean casting ----
  it("casts isAdmin to boolean", () => {
    expect(normalizeUserData({ _id: "test", isAdmin: 1 }).isAdmin).toBe(true);
    expect(normalizeUserData({ _id: "test", isAdmin: "true" }).isAdmin).toBe(
      true,
    );
    expect(normalizeUserData({ _id: "test", isAdmin: 0 }).isAdmin).toBe(false);
    expect(normalizeUserData({ _id: "test", isAdmin: undefined }).isAdmin).toBe(
      false,
    );
  });

  it("casts isBlocked to boolean", () => {
    expect(normalizeUserData({ _id: "test", isBlocked: "yes" }).isBlocked).toBe(
      true,
    );
    expect(normalizeUserData({ _id: "test", isBlocked: null }).isBlocked).toBe(
      false,
    );
  });

  // ---- Array defensive copying ----
  it("defensively copies the badges array", () => {
    const badges = [{ id: "a" }];
    const result = normalizeUserData({ _id: "test", badges });

    badges.push({ id: "b" });
    expect(result.badges).toEqual([{ id: "a" }]);
  });

  it("defensively copies completedLessons", () => {
    const lessons = ["l1"];
    const result = normalizeUserData({
      _id: "test",
      completedLessons: lessons,
    });

    lessons.push("l2");
    expect(result.completedLessons).toEqual(["l1"]);
  });

  it("defaults badges to empty array when not an array", () => {
    expect(
      normalizeUserData({ _id: "test", badges: "not-an-array" }).badges,
    ).toEqual([]);
    expect(normalizeUserData({ _id: "test", badges: null }).badges).toEqual([]);
  });
});
