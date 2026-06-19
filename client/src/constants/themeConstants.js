// /constants/themeConstants.js

/**
 * Theme constants for Python-themed color scheme and styling.
 * Provides CSS custom properties and color mappings for consistent theming.
 */

/**
 * Core Python theme colors using CSS custom properties.
 * Used throughout the application for consistent Python branding.
 */
export const PYTHON_BLUE = "var(--color-python-blue)";
export const PYTHON_YELLOW = "var(--color-python-yellow)";
export const PYTHON_DARK = "var(--color-python-dark)";
export const PYTHON_LIGHT = "var(--color-python-light)";

/**
 * Theme color palette for progress-based theming with percentage mappings.
 * Colors correspond to user progress levels (0-100% completion).
 */
export const THEME_COLORS = {
  DEFAULT: "#3776ab",
  RED: "#ef4444", // 0-25%
  ORANGE: "#f97316", // 25-40%
  AMBER: "#fb923c", // 40-55%
  YELLOW: "#FFD700", // 55-70%
  LIME: "#84cc16", // 70-85%
  GREEN: "#22c55e", // 85-100%
};

/**
 * Hover color variants for theme colors with adjusted brightness.
 * Used for interactive elements and hover states.
 */
export const THEME_HOVER_COVERS = {
  DEFAULT: "#ffd43b",
  RED: "#d73d3d",
  ORANGE: "#e06c14",
  AMBER: "#ea8029",
  YELLOW: "#e6c300",
  LIME: "#75b214",
  GREEN: "#1eab52",
};

/**
 * Routes that use default theme styling instead of progress-based theming.
 * These paths maintain consistent Python blue theming regardless of user progress.
 */
export const DEFAULT_THEME_PATHS = ["/", "/login", "/register"];

/**
 * Path prefix for admin routes to apply special admin theming.
 * Used to identify admin sections for custom styling.
 */
export const ADMIN_PATH_PREFIX = "/admin";
