// LessonItem.jsx
import { Link } from "react-router-dom";
import {
  CheckCircle,
  PlayCircle,
  Lock,
  Clock,
  Star,
  ChevronRight,
} from "lucide-react";

/**
 * Individual lesson row displaying status, metadata, and action button.
 * @component
 * @param {Object} props
 * @param {Object} props.lesson - Lesson data object
 * @param {string} props.lesson._id - Unique lesson identifier
 * @param {string} props.lesson.title - Lesson title
 * @param {string} props.lesson.description - Brief lesson description
 * @param {number} props.lesson.duration - Lesson duration in minutes
 * @param {number} props.lesson.xpReward - XP earned upon completion
 * @param {string} props.lesson.contentType - Type of content (video, text, quiz)
 * @param {boolean} props.lesson.isCompleted - Whether user has completed this lesson
 * @param {string} props.moduleId - Parent module identifier
 * @param {boolean} props.isLocked - Whether lesson is locked by prerequisites
 * @param {string} [props.accentColor] - Theme color for interactive elements
 */

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-4 flex-1 min-w-0 w-full">
          {/* Lesson Status Icon */}
          <div
            className={`p-2 rounded-full shrink-0 ${
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
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 truncate">
              {lesson.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
              {lesson.description}
            </p>

            {/* Metadata - wrap on tiny screens */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-gray-500 dark:text-gray-300">
              <div className="flex items-center space-x-1 shrink-0">
                <Clock size={12} />
                <span>{lesson.duration} min</span>
              </div>
              <div className="flex items-center space-x-1 shrink-0">
                <Star size={12} />
                <span>{lesson.xpReward} XP</span>
              </div>
              <span
                className="capitalize px-2 py-0.5 text-white font-bold rounded-full shrink-0"
                style={{ backgroundColor: resolvedAccent }}
              >
                {lesson.contentType}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
          {!isLocked && (
            <Link
              to={`/lessons/${lesson._id}`}
              className="flex items-center justify-center space-x-2 text-white py-2 px-6 rounded-lg font-semibold hover:opacity-90 transition w-full"
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
