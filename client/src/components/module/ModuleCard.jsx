// components/./ModuleCard.jsx
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

const ModuleCard = ({ module, isLocked }) => {
  const { getModuleThemeColor } = useTheme();

  const moduleLessonProgress = module.moduleLessonProgress || 0;

  const moduleAccentColor = getModuleThemeColor(moduleLessonProgress);

  return (
    <div
      className={`
      relative bg-white rounded-xl shadow-lg border-2 p-6 transition-all duration-300
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
      <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
        {module.title}
      </h3>

      {/* Short Description */}
      <p className="text-gray-600 text-sm text-center mb-4 line-clamp-2">
        {module.shortDescription}
      </p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span style={{ color: moduleAccentColor, fontWeight: "600" }}>
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
      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
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
          style={{ backgroundColor: moduleAccentColor }}
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
