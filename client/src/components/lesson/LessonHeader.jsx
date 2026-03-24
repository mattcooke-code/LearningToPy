import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Star,
  BookOpen,
  RefreshCw,
  Flag,
} from "lucide-react";

const LessonHeader = ({
  lesson,
  isReviewMode,
  toggleReviewMode,
  navigate,
  onReport,
}) => {
  return (
    <div className="mb-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition mb-4"
      >
        <ArrowLeft size={20} />
        <span>Back to Lessons</span>
      </button>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              {lesson.isCompleted && (
                <CheckCircle className="text-green-500" size={24} />
              )}
              <h1 className="text-3xl font-bold text-gray-800">
                {lesson.title}
              </h1>
            </div>

            <p className="text-gray-600 text-lg mb-4">
              {lesson.shortDescription}
            </p>

            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock size={16} />
                <span>{lesson.duration} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star size={16} />
                <span>{lesson.xpReward} XP</span>
              </div>
              <div className="flex items-center space-x-1">
                <BookOpen size={16} />
                <span className="capitalize">{lesson.contentType}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Report Button */}
            <button
              onClick={onReport}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Report this lesson"
            >
              <Flag className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col items-end space-y-2">
            {lesson.isCompleted && (
              <>
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                  Completed ✅
                </div>
                <button
                  onClick={toggleReviewMode}
                  className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold hover:bg-blue-200 transition flex items-center space-x-2"
                >
                  <RefreshCw size={16} />
                  <span>{isReviewMode ? "Exit Review" : "Practice Again"}</span>
                </button>
              </>
            )}
            {isReviewMode && !lesson.isCompleted && (
              <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold text-sm">
                Practice Mode
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonHeader;
