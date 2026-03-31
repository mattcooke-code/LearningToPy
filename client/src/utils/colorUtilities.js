//colorUtilities.js

import { THEME_COLORS, THEME_HOVER_COVERS } from "../constants/themeConstants";

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
