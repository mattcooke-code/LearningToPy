// components/LessonItem.jsx
import { Link } from "react-router-dom";
import {
  CheckCircle,
  PlayCircle,
  Lock,
  Clock,
  Star,
  ChevronRight,
} from "lucide-react";

const LessonItem = ({ lesson, moduleId, isLocked, accentColor }) => {
  const resolvedAccent = accentColor || "#3776AB";

  return (
    <div
      className={`
      bg-white dark:bg-gray-700 rounded-lg shadow-md border-2 p-4 transition-all duration-300
      ${
        isLocked
          ? "border-gray-200 opacity-60"
          : "border-transparent hover:shadow-lg hover:scale-102"
      }
    `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Lesson Status Icon */}
          <div
            className={`p-2 rounded-full ${
              lesson.isCompleted
                ? "bg-green-100 dark:bg-green-600 text-green-600 dark:text-green-100"
                : isLocked
                  ? "bg-gray-100 text-gray-400"
                  : "bg-blue-100"
            }`}
            style={
              !lesson.isCompleted && !isLocked
                ? {
                    backgroundColor: `${resolvedAccent}20`,
                    color: resolvedAccent,
                  }
                : {}
            }
          >
            {lesson.isCompleted ? (
              <CheckCircle size={20} />
            ) : isLocked ? (
              <Lock size={20} />
            ) : (
              <PlayCircle size={20} />
            )}
          </div>

          {/* Lesson Content */}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              {lesson.order}. {lesson.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300  mt-1 line-clamp-2">
              {lesson.shortDescription}
            </p>

            {/* Lesson Metadata */}
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-300">
              <div className="flex items-center space-x-1">
                <Clock size={12} />
                <span>{lesson.duration} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star size={12} />
                <span>{lesson.xpReward} XP</span>
              </div>
              <span className="capitalize px-2 py-1 bg-python-dark text-python-light dark:bg-python-blue dark:text-python-yellow rounded-full">
                {lesson.contentType}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="ml-4">
          {isLocked ? (
            <button disabled className="text-gray-400 p-2 cursor-not-allowed">
              <Lock size={20} />
            </button>
          ) : (
            <Link
              to={`/lessons/${lesson._id}`}
              className="flex items-center space-x-2 text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition"
              style={{ backgroundColor: resolvedAccent }}
            >
              <span>{lesson.isCompleted ? "Review" : "Start"}</span>
              <ChevronRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonItem;
