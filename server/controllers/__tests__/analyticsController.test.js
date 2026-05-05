import { describe, it, expect } from "vitest";

import {
  getDateRange,
  formatRetentionCohorts,
} from "../../controllers/analyticsController";

describe("getDateRange", () => {
  it("returns custom dates when provided", () => {
    const result = getDateRange("7d", "2026-01-01", "2026-01-31");
    expect(result.start).toEqual(new Date("2026-01-01"));
    expect(result.end).toEqual(new Date("2026-01-31"));
  });

  it('handles "all" range (epoch start)', () => {
    const result = getDateRange("all");
    expect(result.start).toEqual(new Date(0));
  });

  it("returns objects with start and end keys for any range", () => {
    const ranges = ["24h", "7d", "30d", "90d", "1y", "invalid"];
    for (const range of ranges) {
      const result = getDateRange(range);
      expect(result).toHaveProperty("start");
      expect(result).toHaveProperty("end");
      expect(result.start).toBeInstanceOf(Date);
      expect(result.end).toBeInstanceOf(Date);
      expect(result.start <= result.end).toBe(true);
    }
  });

  it("defaults to 30d for unrecognized range", () => {
    const result1 = getDateRange("invalid");
    const result2 = getDateRange("30d");
    // Both should produce same offset (start is ~30 days ago)
    const diff = Math.abs(result1.start - result2.start);
    expect(diff).toBeLessThan(60000); // Within 1 minute
  });
});

describe("formatRetentionCohorts", () => {
  it("computes week rates from raw counts", () => {
    const rawData = {
      "2026-01": { total: 100, week1: 80, week2: 60, week3: 40, week4: 20 },
      "2026-02": { total: 50, week1: 45, week2: 30, week3: 15, week4: 5 },
    };

    const result = formatRetentionCohorts(rawData);

    expect(result).toHaveLength(2);
    expect(result[0].week1Rate).toBe(80);
    expect(result[1].week1Rate).toBe(90);
  });

  it("avoids division by zero on empty cohorts", () => {
    const rawData = {
      "2026-03": { total: 0, week1: 0, week2: 0, week3: 0, week4: 0 },
    };

    const result = formatRetentionCohorts(rawData);

    expect(result[0].week1Rate).toBe(0);
  });

  it("returns empty array for empty input", () => {
    expect(formatRetentionCohorts({})).toEqual([]);
  });
});
