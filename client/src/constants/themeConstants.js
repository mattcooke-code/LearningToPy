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
  DEFAULT: "#2c5f8a",
  RED: "#c53030",
  ORANGE: "#c2410c",
  AMBER: "#b45309",
  YELLOW: "#b8860b",
  LIME: "#4d7c0f",
  GREEN: "#15803d",
};

/**
 * Hover color variants for theme colors with adjusted brightness.
 * Used for interactive elements and hover states.
 */
export const THEME_HOVER_COVERS = {
  DEFAULT: "#1e415e",
  RED: "#9b2c2c",
  ORANGE: "#9a3412",
  AMBER: "#92400e",
  YELLOW: "#9a7b0b",
  LIME: "#3f6212",
  GREEN: "#166534",
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
