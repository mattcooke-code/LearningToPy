//colorUtilities.js

import { PYTHON_BLUE, PYTHON_YELLOW } from "../constants/themeConstants";

export const THEME_COLORS = {
  DEFAULT: PYTHON_BLUE, // Python blue
  RED: "#ef4444", // 0-25%
  ORANGE: "#f97316", // 25-40%
  AMBER: "#fb923c", // 40-55% - NEW: light orange/amber
  YELLOW: "#FFD700", // 55-70%
  LIME: "#84cc16", // 70-85%
  GREEN: "#22c55e", // 85-100%
};

export const THEME_HOVER_COVERS = {
  DEFAULT: PYTHON_YELLOW, // Python yellow
  RED: "#d73d3d",
  ORANGE: "#e06c14",
  AMBER: "#ea8029", // NEW: darker amber for hover
  YELLOW: "#e6c300",
  LIME: "#75b214",
  GREEN: "#1eab52",
};

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

export const shouldUseThemeColor = (pathname) => {
  return (
    pathname === "/modules" ||
    pathname.includes("/modules/") ||
    pathname.includes("/lessons/") ||
    pathname === "/dashboard" ||
    pathname === "/profile"
  );
};
