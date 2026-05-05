import { describe, it, expect } from "vitest";
import {
  slugify,
  toStringId,
  normalizeDate,
  isSameDay,
  getDateKey,
  normalizeTags,
  checkDate,
} from "../../utils/generalUtils";

describe("slugify", () => {
  it("returns empty string for falsy input", () => {
    expect(slugify("")).toBe("");
    expect(slugify(null)).toBe("");
  });

  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("hello---world")).toBe("hello-world");
  });

  it("handles numbers", () => {
    expect(slugify("Module 1 Fundamentals")).toBe("module-1-fundamentals");
  });
});

describe("toStringId", () => {
  it("returns null for falsy input", () => {
    expect(toStringId(null)).toBe(null);
    expect(toStringId(undefined)).toBe(null);
    expect(toStringId("")).toBe(null);
  });

  it("returns strings as-is", () => {
    expect(toStringId("abc123")).toBe("abc123");
  });

  it("converts objects with toString to string", () => {
    expect(toStringId({ toString: () => "converted" })).toBe("converted");
  });
});

describe("normalizeDate", () => {
  it("returns null for falsy input", () => {
    expect(normalizeDate(null)).toBe(null);
    expect(normalizeDate("")).toBe(null);
  });

  it("returns null for invalid dates", () => {
    expect(normalizeDate("not-a-date")).toBe(null);
  });

  it("returns Date object for valid date strings", () => {
    const result = normalizeDate("2026-01-01");
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe("2026-01-01T00:00:00.000Z");
  });

  it("returns the same Date if already a Date", () => {
    const date = new Date("2026-01-01");
    expect(normalizeDate(date)).toBe(date);
  });
});

describe("checkDate", () => {
  it("returns local midnight timestamp", () => {
    const d = new Date("2026-06-15T12:30:45Z");
    d.setHours(0, 0, 0, 0);
    const expected = d.getTime();
    expect(checkDate("2026-06-15T12:30:45Z")).toBe(expected);
  });
});

describe("isSameDay", () => {
  it("returns false if either date is invalid", () => {
    expect(isSameDay("invalid", "2026-01-01")).toBe(false);
    expect(isSameDay(null, "2026-01-01")).toBe(false);
  });

  it("returns true for same calendar day", () => {
    expect(isSameDay("2026-01-01T10:00:00Z", "2026-01-01T23:59:59Z")).toBe(
      true,
    );
  });

  it("returns false for different days", () => {
    expect(isSameDay("2026-01-01", "2026-01-02")).toBe(false);
  });

  it("handles dates from different time representations", () => {
    expect(isSameDay("2026-01-01T10:00:00Z", "2026-01-01T14:00:00Z")).toBe(
      true,
    );
  });
});

describe("getDateKey", () => {
  it("returns null for invalid dates", () => {
    expect(getDateKey(null)).toBe(null);
    expect(getDateKey("invalid")).toBe(null);
  });

  it("returns YYYY-MM-DD format", () => {
    expect(getDateKey("2026-06-15")).toBe("2026-06-15");
  });

  it("strips time component", () => {
    expect(getDateKey("2026-06-15T12:30:45Z")).toBe("2026-06-15");
  });
});

describe("normalizeTags", () => {
  it("returns empty array for falsy input", () => {
    expect(normalizeTags(null)).toEqual([]);
    expect(normalizeTags(undefined)).toEqual([]);
  });

  it("lowercases and trims tags", () => {
    expect(normalizeTags(["Python", "  JavaScript  "])).toEqual([
      "python",
      "javascript",
    ]);
  });

  it("filters out empty tags", () => {
    expect(normalizeTags(["Python", "", "  ", null])).toEqual(["python"]);
  });

  it("handles non-array input", () => {
    expect(normalizeTags("not-an-array")).toEqual([]);
  });
});
