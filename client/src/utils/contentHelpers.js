// utils/contentHelpers.js

export const DIFFICULTY_STYLES = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  intermediate:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

/**
 * Returns the CSS class string for a difficulty badge
 * @param {string} difficulty - The difficulty level
 * @returns {string} Tailwind CSS classes for the badge
 */
export const getDifficultyStyles = (difficulty) => {
  return DIFFICULTY_STYLES[difficulty] || "bg-gray-100 text-gray-800";
};

/**
 * Returns a formatted label for a difficulty level
 * @param {string} difficulty - The difficulty level
 * @returns {string} Formatted difficulty label
 */
export const getDifficultyLabel = (difficulty) => {
  return difficulty
    ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    : "Unknown";
};

export const TYPE_ICON_MAP = {
  lesson: {
    icon: "FileText",
    bgColor: "blue",
    label: "Lesson",
    iconClass: "bg-blue-100 dark:bg-blue-900",
    textClass: "text-blue-600 dark:text-blue-400",
  },
  module: {
    icon: "BookOpen",
    bgColor: "purple",
    label: "Module",
    iconClass: "bg-purple-100 dark:bg-purple-900",
    textClass: "text-purple-600 dark:text-purple-400",
  },
};
