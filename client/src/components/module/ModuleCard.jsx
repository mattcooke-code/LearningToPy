// ModuleCard.jsx
import { Link } from "react-router-dom";
import { useTheme } from "../../context";
import {
  Lock,
  CheckCircle,
  PlayCircle,
  Clock,
  BookOpen,
  Star,
} from "lucide-react";

/**
 * Interactive card displaying module information, progress tracking, and action buttons.
 * @component
 * @param {Object} props
 * @param {Object} props.module - Module data object
 * @param {string} props.module.title - Module title
 * @param {string} props.module.shortDescription - Brief description of module content
 * @param {number} props.module.moduleLessonProgress - Progress percentage (0-100)
 * @param {boolean} props.module.isCompleted - Whether module is fully completed
 * @param {string} props.module._id - Unique module identifier for routing
 * @param {number} props.module.estimatedHours - Estimated completion time in hours
 * @param {number} props.module.lessonCount - Number of lessons in the module
 * @param {number} props.module.xpReward - XP awarded upon completion
 * @param {string} [props.module.icon] - Optional icon/emoji for the module
 * @param {boolean} props.isLocked - Whether module is locked due to prerequisites
 */

const ModuleCard = ({ module, isLocked }) => {
  const { getModuleThemeColor, getModuleTextColor } = useTheme();

  const moduleLessonProgress = module.moduleLessonProgress || 0;
  const moduleAccentColor = getModuleThemeColor(moduleLessonProgress);

  const accentTextColor = getModuleTextColor(moduleLessonProgress);

  return (
    <div
      className={`
      relative bg-white rounded-xl shadow-lg border-2 p-6 transition-all duration-300 dark:bg-gray-700
      ${
        isLocked
          ? "border-gray-300 opacity-60"
          : "border-transparent hover:shadow-xl hover:scale-105"
      }
    `}
    >
      {/* Lock Icon for locked modules */}
      {isLocked && (
        <div className="absolute -top-3 -right-3 bg-gray-500 text-white p-2 rounded-full">
          <Lock size={20} />
        </div>
      )}

      {/* Completed Badge */}
      {module.isCompleted && (
        <div className="absolute -top-3 -right-3 bg-green-500 text-white p-2 rounded-full">
          <CheckCircle size={20} />
        </div>
      )}

      {/* Module Icon */}
      <div
        className="text-4xl mb-4 text-center"
        style={{ color: moduleAccentColor }}
      >
        {module.icon || "📚"}
      </div>

      {/* Module Title */}
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 text-center mb-2 p-2">
        {module.title}
      </h2>

      {/* Short Description */}
      <p className="text-gray-600 dark:text-gray-300 text-sm text-center mb-4 line-clamp-2">
        {module.shortDescription}
      </p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span style={{ color: accentTextColor, fontWeight: "600" }}>
            {moduleLessonProgress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${moduleLessonProgress}%`,
              backgroundColor: moduleAccentColor,
            }}
          ></div>
        </div>
      </div>

      {/* Module Stats */}
      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center space-x-1">
          <Clock size={14} />
          <span>{module.estimatedHours}h</span>
        </div>
        <div className="flex items-center space-x-1">
          <BookOpen size={14} />
          <span>{module.lessonCount} lessons</span>
        </div>
        <div className="flex items-center space-x-1">
          <Star size={14} />
          <span>{module.xpReward} XP</span>
        </div>
      </div>

      {/* Action Button */}
      {isLocked ? (
        <button
          disabled
          className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-semibold cursor-not-allowed"
        >
          Complete Prerequisites
        </button>
      ) : module.isCompleted ? (
        <Link
          to={`/modules/${module._id}/lessons`}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center space-x-2"
        >
          <CheckCircle size={16} />
          <span>Review</span>
        </Link>
      ) : (
        <Link
          to={`/modules/${module._id}/lessons`}
          className="w-full text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center space-x-2"
          style={{ backgroundColor: moduleAccentColor, color: accentTextColor }}
        >
          <PlayCircle size={16} />
          <span>
            {moduleLessonProgress > 0 ? "Continue" : "Start Learning"}
          </span>
        </Link>
      )}
    </div>
  );
};

export default ModuleCard;
