import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle, RefreshCw } from "lucide-react"; //Refres Component

const LessonNavigation = ({
  navigate,
  nextLesson,
  lesson,
  isReviewMode,
  themeColor,
}) => {
  return (
    <div className="flex justify-between items-center">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
      >
        <ArrowLeft size={20} />
        <span>Back to Lessons</span>
      </button>

      {/* Next Lesson button - now shows even in review mode */}
      {nextLesson && lesson.isCompleted && (
        <Link
          to={`/lessons/${nextLesson._id}`}
          style={{ backgroundColor: themeColor }}
          className="flex items-center space-x-2 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          <span>Next Lesson</span>
          <ArrowRight size={20} />
        </Link>
      )}

      {/* Lesson Completed - only shows when no next lesson available */}
      {lesson.isCompleted && !nextLesson && (
        <div className="text-green-600 font-semibold flex items-center space-x-2">
          <CheckCircle size={20} />
          <span>Lesson Completed!</span>
        </div>
      )}

      {/* Practice Mode - only shows when no next lesson to navigate to */}
      {isReviewMode && !nextLesson && (
        <div className="text-blue-600 font-semibold flex items-center space-x-2">
          <RefreshCw size={20} />
          <span>Practice Mode Active</span>
        </div>
      )}
    </div>
  );
};

export default LessonNavigation;
