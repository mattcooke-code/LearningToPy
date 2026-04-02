import {
  CheckCircle,
  Clock,
  Star,
  BookOpen,
  RefreshCw,
  Flag,
} from "lucide-react";

const LessonHeader = ({ lesson, isReviewMode, toggleReviewMode, onReport }) => {
  return (
    <div className="mb-6">
      <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-4 sm:p-6 mb-6">
        {/* Layout: Stack on mobile, side-by-side on md+ */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Title and Description Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start space-x-3 mb-3">
              {lesson.isCompleted && (
                <CheckCircle
                  className="text-green-500 shrink-0 mt-1"
                  size={24}
                />
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 leading-tight">
                {lesson.title}
              </h1>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-4">
              {lesson.shortDescription}
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1 shrink-0">
                <Clock size={16} />
                <span>{lesson.duration} min</span>
              </div>
              <div className="flex items-center space-x-1 shrink-0">
                <Star size={16} />
                <span>{lesson.xpReward} XP</span>
              </div>
              {/* Metadata tag */}
              <span className="capitalize px-2 py-0.5 bg-gray-100 dark:bg-gray-600 rounded-md text-xs font-medium">
                {lesson.contentType}
              </span>
            </div>
          </div>

          {/* Status & Actions Section (The "Out of Whack" part) */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 border-t md:border-t-0 pt-4 md:pt-0">
            {/* Flags Container */}
            <div className="flex flex-col items-start md:items-end gap-2">
              {lesson.isCompleted && (
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <span>Completed</span>
                  <span className="hidden sm:inline">✅</span>
                </div>
              )}

              {isReviewMode && (
                <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Review Mode
                </span>
              )}
            </div>

            {/* Buttons Group */}
            <div className="flex items-center gap-2">
              {lesson.isCompleted && (
                <button
                  onClick={toggleReviewMode}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center space-x-2 shadow-sm"
                >
                  <RefreshCw
                    size={14}
                    className={isReviewMode ? "animate-spin-slow" : ""}
                  />
                  <span>{isReviewMode ? "Exit" : "Practice"}</span>
                </button>
              )}

              <button
                onClick={onReport}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                title="Report this lesson"
              >
                <Flag className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonHeader;
