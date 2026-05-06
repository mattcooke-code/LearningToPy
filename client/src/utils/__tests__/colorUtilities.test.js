import { describe, it, expect, vi } from "vitest";

// We don't need to mock — vitest can resolve the constants file directly.
// But the CSS variable values won't match hex lookups, so we should be aware
// that `getHoverColor` with a CSS var will return the original value.

import {
  resolveCourseThemeColor,
  getHoverColor,
  shouldUseThemeColor,
} from "../colorUtilities";

// ============================================================================
// resolveCourseThemeColor
// ============================================================================

describe("resolveCourseThemeColor", () => {
  it("returns RED for 0%", () => {
    expect(resolveCourseThemeColor(0)).toBe("#ef4444");
  });

  it("returns RED at the 25% boundary", () => {
    expect(resolveCourseThemeColor(25)).toBe("#ef4444");
  });

  it("returns ORANGE at 26%", () => {
    expect(resolveCourseThemeColor(26)).toBe("#f97316");
  });

  it("returns ORANGE at the 40% boundary", () => {
    expect(resolveCourseThemeColor(40)).toBe("#f97316");
  });

  it("returns AMBER at 41%", () => {
    expect(resolveCourseThemeColor(41)).toBe("#fb923c");
  });

  it("returns AMBER at the 55% boundary", () => {
    expect(resolveCourseThemeColor(55)).toBe("#fb923c");
  });

  it("returns YELLOW at 56%", () => {
    expect(resolveCourseThemeColor(56)).toBe("#FFD700");
  });

  it("returns YELLOW at the 70% boundary", () => {
    expect(resolveCourseThemeColor(70)).toBe("#FFD700");
  });

  it("returns LIME at 71%", () => {
    expect(resolveCourseThemeColor(71)).toBe("#84cc16");
  });

  it("returns LIME at the 85% boundary", () => {
    expect(resolveCourseThemeColor(85)).toBe("#84cc16");
  });

  it("returns GREEN at 86%", () => {
    expect(resolveCourseThemeColor(86)).toBe("#22c55e");
  });

  it("returns GREEN at 100%", () => {
    expect(resolveCourseThemeColor(100)).toBe("#22c55e");
  });

  it("returns GREEN for values above 100%", () => {
    expect(resolveCourseThemeColor(150)).toBe("#22c55e");
  });

  it("returns RED for negative values", () => {
    expect(resolveCourseThemeColor(-10)).toBe("#ef4444");
  });
});

// ============================================================================
// getHoverColor
// ============================================================================

describe("getHoverColor", () => {
  it("returns the hover variant for RED", () => {
    expect(getHoverColor("#ef4444")).toBe("#d73d3d");
  });

  it("returns the hover variant for ORANGE", () => {
    expect(getHoverColor("#f97316")).toBe("#e06c14");
  });

  it("returns the hover variant for AMBER", () => {
    expect(getHoverColor("#fb923c")).toBe("#ea8029");
  });

  it("returns the hover variant for YELLOW", () => {
    expect(getHoverColor("#FFD700")).toBe("#e6c300");
  });

  it("returns the hover variant for LIME", () => {
    expect(getHoverColor("#84cc16")).toBe("#75b214");
  });

  it("returns the hover variant for GREEN", () => {
    expect(getHoverColor("#22c55e")).toBe("#1eab52");
  });

  it("returns the original colour when no hover mapping exists", () => {
    expect(getHoverColor("#000000")).toBe("#000000");
    expect(getHoverColor("#ffffff")).toBe("#ffffff");
  });

  it("returns the hover variant for the DEFAULT theme colour (CSS variable)", () => {
    // THEME_COLORS.DEFAULT = "var(--color-python-blue)"
    // THEME_HOVER_COVERS.DEFAULT = "var(--color-python-yellow)"
    expect(getHoverColor("var(--color-python-blue)")).toBe(
      "var(--color-python-yellow)",
    );
  });

  it("returns the original value when colour is not in THEME_COLORS at all", () => {
    expect(getHoverColor("#bada55")).toBe("#bada55");
    expect(getHoverColor("rgb(255, 0, 0)")).toBe("rgb(255, 0, 0)");
  });
});

// ============================================================================
// shouldUseThemeColor
// ============================================================================

describe("shouldUseThemeColor", () => {
  it("returns true for /modules", () => {
    expect(shouldUseThemeColor("/modules")).toBe(true);
  });

  it("returns true for /modules/ (with trailing slash)", () => {
    expect(shouldUseThemeColor("/modules/")).toBe(true);
  });

  it("returns true for a specific module path", () => {
    expect(shouldUseThemeColor("/modules/python-basics")).toBe(true);
  });

  it("returns true for a nested module path", () => {
    expect(shouldUseThemeColor("/modules/python-basics/lessons")).toBe(true);
  });

  it("returns true for lesson paths", () => {
    expect(shouldUseThemeColor("/lessons/123")).toBe(true);
  });

  it("returns true for /dashboard", () => {
    expect(shouldUseThemeColor("/dashboard")).toBe(true);
  });

  it("returns true for /profile", () => {
    expect(shouldUseThemeColor("/profile")).toBe(true);
  });

  it("returns false for / (home)", () => {
    expect(shouldUseThemeColor("/")).toBe(false);
  });

  it("returns false for /login", () => {
    expect(shouldUseThemeColor("/login")).toBe(false);
  });

  it("returns false for /admin", () => {
    expect(shouldUseThemeColor("/admin")).toBe(false);
  });

  it("returns false for /settings", () => {
    expect(shouldUseThemeColor("/settings")).toBe(false);
  });

  it("returns false for an unrelated path", () => {
    expect(shouldUseThemeColor("/faq")).toBe(false);
  });
});
