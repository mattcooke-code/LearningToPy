import { describe, it, expect, vi } from "vitest";

// Mock the DB models
vi.mock("../../models/Module", () => ({
  default: {
    find: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock("../../models/Lesson", () => ({
  default: {
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock("../../utils/generalUtils", () => ({
  toStringId: vi.fn((id) => (id ? id.toString() : null)),
}));

vi.mock("../../shared/constants/progress.cjs", () => ({
  XP: {
    PER_LEVEL: 100,
    EXERCISE: {
      SUBMISSION_BASE: 5,
      FIRST_TRY_BONUS: 10,
      MAX_SUBMISSION_XP: 25,
    },
  },
  THRESHOLDS: {},
  calculateLessonQuizXP: vi.fn(),
  calculateExerciseXP: vi.fn(),
  getPhaseBonus: vi.fn(),
}));

vi.mock("../../shared/constants/badgeDefinitions.cjs", () => ({
  BADGE_DEFINITIONS_CORE: [
    {
      id: "module-1-complete",
      name: "Module 1",
      category: "module",
      module: 1,
      phase: null,
      tier: null,
      description: "Complete Module 1",
    },
    {
      id: "module-2-complete",
      name: "Module 2",
      category: "module",
      module: 2,
      phase: null,
      tier: null,
      description: "Complete Module 2",
    },
    {
      id: "phase-1-complete",
      name: "Phase 1 Complete",
      category: "phase",
      module: null,
      phase: 1,
      tier: null,
      description: "Complete Phase 1",
    },
    {
      id: "halfway-there",
      name: "Halfway There",
      category: "milestone",
      module: null,
      phase: null,
      tier: null,
      description: "Complete 10 modules",
    },
    {
      id: "course-complete",
      name: "Course Complete",
      category: "milestone",
      module: null,
      phase: null,
      tier: null,
      description: "Complete all 20 modules",
    },
    {
      id: "first-quiz",
      name: "First Quiz",
      category: "engagement",
      module: null,
      phase: null,
      tier: null,
      description: "Complete your first quiz",
    },
    {
      id: "first-challenge",
      name: "First Challenge",
      category: "engagement",
      module: null,
      phase: null,
      tier: null,
      description: "Complete your first coding challenge",
    },
    {
      id: "reached-the-summit",
      name: "Reached the Summit",
      category: "leaderboard",
      module: null,
      phase: null,
      tier: null,
      description: "Rank #1",
    },
    {
      id: "top-ten",
      name: "Top Ten",
      category: "leaderboard",
      module: null,
      phase: null,
      tier: null,
      description: "Rank in top 10",
    },
  ],
}));

import { awardLeaderboardBadge } from "../../services/gamification";

// --- TESTS ---

describe("awardLeaderboardBadge", () => {
  it("returns false for invalid badge IDs", async () => {
    const user = {
      badges: [],
      save: vi.fn().mockResolvedValue(true),
    };

    const result = await awardLeaderboardBadge(user, "invalid-badge");
    expect(result).toBe(false);
    expect(user.badges).toHaveLength(0);
  });

  it("returns false if user already has the badge", async () => {
    const user = {
      badges: ["top-ten"],
      save: vi.fn().mockResolvedValue(true),
    };

    const result = await awardLeaderboardBadge(user, "top-ten");
    expect(result).toBe(false);
    expect(user.save).not.toHaveBeenCalled();
  });

  it('awards "top-ten" badge to user without it', async () => {
    const user = {
      badges: [],
      save: vi.fn().mockResolvedValue(true),
    };

    const result = await awardLeaderboardBadge(user, "top-ten");
    expect(result).toBe(true);
    expect(user.badges).toContain("top-ten");
    expect(user.save).toHaveBeenCalled();
  });

  it('awards "reached-the-summit" badge', async () => {
    const user = {
      badges: [],
      save: vi.fn().mockResolvedValue(true),
    };

    const result = await awardLeaderboardBadge(user, "reached-the-summit");
    expect(result).toBe(true);
    expect(user.badges).toContain("reached-the-summit");
  });

  it("preserves existing badges when adding a new one", async () => {
    const user = {
      badges: ["module-1-complete", "first-quiz"],
      save: vi.fn().mockResolvedValue(true),
    };

    await awardLeaderboardBadge(user, "top-ten");
    expect(user.badges).toContain("module-1-complete");
    expect(user.badges).toContain("first-quiz");
    expect(user.badges).toContain("top-ten");
    expect(user.badges).toHaveLength(3);
  });

  it("handles null badges array", async () => {
    const user = {
      badges: null,
      save: vi.fn().mockResolvedValue(true),
    };

    const result = await awardLeaderboardBadge(user, "top-ten");
    expect(result).toBe(true);
    expect(Array.isArray(user.badges)).toBe(true);
    expect(user.badges).toContain("top-ten");
  });
});
