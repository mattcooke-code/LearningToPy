// /client/src/utils/colorUtilities.js
/**
 * @fileoverview Theme colour resolution utilities.
 *
 * Maps user progress percentages to theme colours (red → orange → amber →
 * yellow → lime → green), resolves hover-state variants, and determines
 * which routes should display theme-coloured UI elements.
 *
 * @module utils/colorUtilities
 * @requires ../constants/themeConstants
 */

import { THEME_COLORS, THEME_HOVER_COVERS } from "../constants/themeConstants";

/**
 * Map a course completion percentage to the corresponding theme colour.
 *
 * Progress bands:
 * - 0–25%  → `THEME_COLORS.RED`
 * - 26–40% → `THEME_COLORS.ORANGE`
 * - 41–55% → `THEME_COLORS.AMBER`
 * - 56–70% → `THEME_COLORS.YELLOW`
 * - 71–85% → `THEME_COLORS.LIME`
 * - 86–100% → `THEME_COLORS.GREEN`
 *
 * Used by `ThemeContext.updateThemeFromCourseProgress` to set the global
 * accent colour as the user advances through the curriculum.
 *
 * @param {number} courseProgressPercentage - A value between 0 and 100.
 * @returns {string} A theme colour hex value or constant name.
 */
export const resolveCourseThemeColor = (courseProgressPercentage) => {
  if (courseProgressPercentage <= 25) {
    return THEME_COLORS.RED;
  }
  if (courseProgressPercentage <= 40) {
    return THEME_COLORS.ORANGE;
  }
  if (courseProgressPercentage <= 55) {
    return THEME_COLORS.AMBER;
  }
  if (courseProgressPercentage <= 70) {
    return THEME_COLORS.YELLOW;
  }
  if (courseProgressPercentage <= 85) {
    return THEME_COLORS.LIME;
  }
  return THEME_COLORS.GREEN;
};

/**
 * Resolve the hover-state variant of a theme colour.
 *
 * Looks up the base colour in `THEME_COLORS` to find its key, then returns
 * the corresponding entry from `THEME_HOVER_COVERS`. If no mapping exists
 * the original colour is returned unchanged.
 *
 * @param {string} baseColor - A hex colour string (e.g. `"#EF4444"`).
 * @returns {string} The hover variant colour, or `baseColor` if no mapping
 *   is found.
 */
export const getHoverColor = (baseColor) => {
  const entry = Object.entries(THEME_COLORS).find(
    ([, hex]) => hex === baseColor,
  );

  if (entry) {
    const key = entry[0];
    return THEME_HOVER_COVERS[key] || baseColor;
  }
  return baseColor;
};

/**
 * Determine whether the current route should display theme-coloured UI
 * elements (progress bars, accent backgrounds, etc.).
 *
 * Returns `true` for learning-related routes: modules listing, module
 * detail, lesson pages, dashboard, and profile.
 *
 * @param {string} pathname - The current `window.location.pathname`.
 * @returns {boolean} True if theme colours should be applied on this route.
 */
export const shouldUseThemeColor = (pathname) => {
  return (
    pathname === "/modules" ||
    pathname.includes("/modules/") ||
    pathname.includes("/lessons/") ||
    pathname === "/dashboard" ||
    pathname === "/profile"
  );
};
