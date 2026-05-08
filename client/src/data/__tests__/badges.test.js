// src/data/__tests__/badges.test.js
import { describe, it, expect } from "vitest";
import { BADGE_LIBRARY, BADGES_BY_ID } from "@/data/badges";

describe("badges data", () => {
  describe("BADGE_LIBRARY", () => {
    it("should be an array", () => {
      expect(Array.isArray(BADGE_LIBRARY)).toBe(true);
    });

    it("should not be empty", () => {
      expect(BADGE_LIBRARY.length).toBeGreaterThan(0);
    });

    it("should have valid badge objects", () => {
      BADGE_LIBRARY.forEach((badge) => {
        expect(badge).toHaveProperty("id");
        expect(badge).toHaveProperty("name");
        expect(badge).toHaveProperty("description");
        expect(typeof badge.id).toBe("string");
        expect(typeof badge.name).toBe("string");
        expect(typeof badge.description).toBe("string");

        // icon is optional - only check if present
        if (badge.icon) {
          // icon could be string or component
          expect(["string", "function", "object"]).toContain(typeof badge.icon);
        }
      });
    });

    it("should have unique badge IDs", () => {
      const ids = BADGE_LIBRARY.map((badge) => badge.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have non-empty IDs and names", () => {
      BADGE_LIBRARY.forEach((badge) => {
        expect(badge.id.length).toBeGreaterThan(0);
        expect(badge.name.length).toBeGreaterThan(0);
        expect(badge.description.length).toBeGreaterThan(0);
      });
    });

    it("should have evaluation criteria if defined", () => {
      BADGE_LIBRARY.forEach((badge) => {
        // Some badges might have criteria property
        if (badge.criteria) {
          expect(typeof badge.criteria).toBe("object");
        }
      });
    });
  });

  describe("BADGES_BY_ID", () => {
    it("should be an object", () => {
      expect(typeof BADGES_BY_ID).toBe("object");
      expect(BADGES_BY_ID).not.toBeNull();
    });

    it("should have the same number of entries as BADGE_LIBRARY", () => {
      expect(Object.keys(BADGES_BY_ID)).toHaveLength(BADGE_LIBRARY.length);
    });

    it("should map every badge ID to its badge object", () => {
      BADGE_LIBRARY.forEach((badge) => {
        expect(BADGES_BY_ID[badge.id]).toEqual(badge);
      });
    });

    it("should allow O(1) badge lookup by ID", () => {
      // Get first badge for testing
      const firstBadge = BADGE_LIBRARY[0];
      const lookupResult = BADGES_BY_ID[firstBadge.id];

      expect(lookupResult).toBeDefined();
      expect(lookupResult.id).toBe(firstBadge.id);
      expect(lookupResult.name).toBe(firstBadge.name);
      expect(lookupResult.description).toBe(firstBadge.description);
    });

    it("should return undefined for non-existent badge IDs", () => {
      expect(BADGES_BY_ID["non-existent-badge"]).toBeUndefined();
      expect(BADGES_BY_ID[""]).toBeUndefined();
    });

    it("should have all keys as strings", () => {
      Object.keys(BADGES_BY_ID).forEach((key) => {
        expect(typeof key).toBe("string");
      });
    });
  });

  describe("Data Integrity", () => {
    it("BADGE_LIBRARY and BADGES_BY_ID should be in sync", () => {
      const libraryIds = BADGE_LIBRARY.map((b) => b.id).sort();
      const mapIds = Object.keys(BADGES_BY_ID).sort();

      expect(libraryIds).toEqual(mapIds);
    });

    it("should not have duplicate badge objects in memory", () => {
      // Verify that BADGES_BY_ID references the same objects as BADGE_LIBRARY
      BADGE_LIBRARY.forEach((badge) => {
        expect(BADGES_BY_ID[badge.id]).toBe(badge);
      });
    });
  });

  describe("Common Badge IDs (if they exist)", () => {
    it("should contain expected first-lesson badge if defined", () => {
      if (BADGES_BY_ID["first-lesson"]) {
        const badge = BADGES_BY_ID["first-lesson"];
        expect(badge.name).toBeDefined();
        expect(badge.description).toBeDefined();
      }
    });

    it("should have meaningful badge names", () => {
      BADGE_LIBRARY.forEach((badge) => {
        // Names should be more than just IDs
        expect(badge.name.length).toBeGreaterThanOrEqual(2);
      });
    });
  });
});
