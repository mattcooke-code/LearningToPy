// /client/src/utils/colorUtilities.js
/**
 * @fileoverview Theme colour resolution utilities.
 *
 * Maps user progress percentages to theme colours (red → orange → amber →
 * yellow → lime → green), resolves hover-state variants, determines which
 * routes should display theme-coloured UI elements, and applies/persists the
 * resolved colour to the DOM and localStorage.
 *
 * This is the single source of truth for theme colour logic — previously
 * split between this file and a now-removed `themeUtils.js` that duplicated
 * (and drifted from) the hover-colour mapping and persistence logic below.
 *
 * @module utils/colorUtilities
 * @requires ../constants/themeConstants
 */

import {
  THEME_COLORS,
  THEME_HOVER_COVERS,
  THEME_TEXT_COLORS,
} from "../constants/themeConstants";

/**
 * Default accent colour (Python blue), used whenever no valid colour is
 * stored in localStorage or when explicitly resetting the theme.
 *
 * @type {string}
 */
export const DEFAULT_THEME_COLOR = "#2c5f8a";

/**
 * Default hover colour (Python yellow), paired with `DEFAULT_THEME_COLOR`.
 *
 * @type {string}
 */
export const DEFAULT_HOVER_COLOR = "#1e415e";

/**
 * localStorage key under which the user's chosen theme colour is persisted.
 *
 * @type {string}
 */
const THEME_COLOR_STORAGE_KEY = "themeColor";

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

/**
 * Apply a theme colour (and its derived hover variant) to the document root
 * as CSS custom properties (`--theme-color`, `--theme-hover-color`).
 *
 * This lets Tailwind classes like `bg-theme` / `hover:bg-theme-hover` work
 * without JS hover handlers.
 *
 * @param {string} color - A hex colour string.
 */
export const applyThemeColor = (color) => {
  const root = document.documentElement;
  root.style.setProperty("--theme-color", color);
  root.style.setProperty("--theme-hover-color", getHoverColor(color));
  root.style.setProperty("--theme-text-color", getTextColorForTheme(color));
};

/**
 * Read the persisted theme colour from localStorage, falling back to
 * `DEFAULT_THEME_COLOR` if nothing valid is stored.
 *
 * @returns {string} A hex colour string.
 */
export const getStoredThemeColor = () => {
  const saved = localStorage.getItem(THEME_COLOR_STORAGE_KEY);
  return saved && saved.startsWith("#") ? saved : DEFAULT_THEME_COLOR;
};

/**
 * Apply a theme colour to the DOM and persist it to localStorage.
 *
 * @param {string} color - A hex colour string.
 */
export const setStoredThemeColor = (color) => {
  applyThemeColor(color);
  localStorage.setItem(THEME_COLOR_STORAGE_KEY, color);
};

/**
 * Reset the theme colour to its default, both in the DOM and localStorage.
 */
export const resetStoredThemeColor = () => {
  applyThemeColor(DEFAULT_THEME_COLOR);
  localStorage.removeItem(THEME_COLOR_STORAGE_KEY);
};

/**
 * Theme Text Color Helper
 */
export const getTextColorForTheme = (color) => {
  const entry = Object.entries(THEME_COLORS).find(([, hex]) => hex === color);
  if (entry) {
    return THEME_TEXT_COLORS[entry[0]] || "#ffffff";
  }
  return "#ffffff";
};
