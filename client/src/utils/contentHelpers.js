// utils/contentHelpers.js
export const DIFFICULTY_STYLES = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  intermediate:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export const getDifficultyBadge = (difficulty) => {
  const style = DIFFICULTY_STYLES[difficulty] || "bg-gray-100 text-gray-800";
  const label = difficulty
    ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    : "Unknown";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
};

export const TYPE_ICON_MAP = {
  lesson: { icon: "FileText", bgColor: "blue", label: "Lesson" },
  module: { icon: "BookOpen", bgColor: "purple", label: "Module" },
};
