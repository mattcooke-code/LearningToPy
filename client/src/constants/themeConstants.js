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
  ORANGE: "#d1480e",
  AMBER: "#f5a100",
  YELLOW: "#ffd700",
  LIME: "#3d7a1a",
  GREEN: "#15803d",
  PURPLE: "#581c87",
};

/**
 * Hover color variants for theme colors with adjusted brightness.
 * Used for interactive elements and hover states.
 */
export const THEME_HOVER_COVERS = {
  DEFAULT: "#1e415e",
  RED: "#9b2c2c",
  ORANGE: "#b33c0a",
  AMBER: "#a84800",
  YELLOW: "#b89200",
  LIME: "#2d5a12",
  GREEN: "#166534",
  PURPLE: "#421466",
};

// Text color to use on each theme background (for white-text-on-dark-bg situations)
export const THEME_TEXT_COLORS = {
  DEFAULT: "#ffffff",
  RED: "#ffffff",
  ORANGE: "#ffffff",
  AMBER: "#1F1F1F",
  YELLOW: "#1a1a1a",
  LIME: "#ffffff",
  GREEN: "#ffffff",
  PURPLE: "#ffffff",
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
