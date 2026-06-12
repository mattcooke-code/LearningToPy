// QuickActions.jsx
import { Link } from "react-router-dom";
import { PlayCircle, Award, CheckCircle } from "lucide-react";

/**
 * Context-aware action panel showing next steps based on lesson/quiz completion status.
 * Displays one of three states:
 * - Continue with next lesson (standard)
 * - Quiz invitation (lessons complete, quiz pending)
 * - Module mastery celebration (everything complete)
 *
 * @component
 * @param {Object} props
 * @param {Array} props.lessons - Array of lesson objects with completion status
 * @param {string} props.moduleId - Module identifier for quiz routing
 * @param {string} props.accentColor - Theme color for primary action buttons
 * @param {Function} props.onBackToModules - Callback to return to modules list
 * @param {boolean} props.quizCompleted - Whether user has completed the module quiz
 */

const BASE_BTN_CLASS =
  "flex items-center justify-center space-x-2 py-3 px-8 rounded-xl font-bold transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] w-full sm:max-w-xs";

const NEUTRAL_BTN_CLASS =
  "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900";

const QuickActions = ({
  lessons,
  moduleId,
  accentColor,
  onBackToModules,
  quizCompleted,
}) => {
  const nextLesson = lessons.find((lesson) => !lesson.isCompleted);
  const allLessonsDone = lessons.length > 0 && !nextLesson;
  const courseComplete = lessons.length === 1 && !nextLesson;

  // State 1: Module fully completed (Lessons + Quiz)
  if (allLessonsDone && quizCompleted) {
    return (
      <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-green-100 dark:bg-green-800 rounded-full text-green-600 dark:text-green-200 mb-4">
          <CheckCircle size={40} />
        </div>
        <h3 className="text-2xl font-bold text-green-800 dark:text-green-100 mb-2">
          Module Mastered!
        </h3>
        <p className="text-green-700 dark:text-green-300 mb-8 max-w-md mx-auto">
          You've completed every lesson and passed the final quiz. High five!
        </p>
        <div className="flex flex-col items-center justify-center">
          <button
            onClick={onBackToModules}
            className={`${BASE_BTN_CLASS} bg-green-600 text-white hover:bg-green-700`}
          >
            <span>Return to Modules</span>
          </button>
        </div>
      </div>
    );
  }

  // State 2: Course Completed
  if (courseComplete) {
    return (
      <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-green-100 dark:bg-green-800 rounded-full text-green-600 dark:text-green-200 mb-4">
          <CheckCircle size={40} />
        </div>
        <h3 className="text-2xl font-bold text-green-800 dark:text-green-100 mb-2">
          Course Mastered!
        </h3>
        <p className="text-green-700 dark:text-green-300 mb-8 max-w-md mx-auto">
          You've completed every lesson and every module. Congratulations!
        </p>
        <div className="flex flex-col items-center justify-center">
          <button
            onClick={onBackToModules}
            className={`${BASE_BTN_CLASS} bg-green-600 text-white hover:bg-green-700`}
          >
            <span>Return to Modules</span>
          </button>
        </div>
      </div>
    );
  }

  // State 3: Lessons done, Quiz remaining
  if (allLessonsDone && !quizCompleted) {
    return (
      <div className="mt-8 bg-blue-50 dark:bg-gray-800 border-2 border-dashed border-blue-200 dark:border-gray-600 rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-300 mb-4">
          <Award size={40} />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Final Challenge!
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          You've finished all lessons. Are you ready to test your knowledge and
          earn your module badge?
        </p>
        <div className="flex flex-col items-center gap-4">
          <Link
            to={`/modules/${moduleId}/quiz`}
            className={`${BASE_BTN_CLASS} text-white`}
            style={{ backgroundColor: accentColor }}
          >
            <span>Take Final Quiz</span>
          </Link>
          <button
            onClick={onBackToModules}
            className={`${BASE_BTN_CLASS} ${NEUTRAL_BTN_CLASS}`}
          >
            <span>Maybe Later</span>
          </button>
        </div>
      </div>
    );
  }

  // State 4: Standard "Continue"
  return (
    <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 border border-gray-100 dark:border-gray-600 text-center">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
        Ready to keep going?
      </h3>
      <div className="flex flex-col items-center gap-4">
        {nextLesson && (
          <Link
            to={`/lessons/${nextLesson._id}`}
            className={`${BASE_BTN_CLASS} text-white`}
            style={{ backgroundColor: accentColor }}
          >
            <PlayCircle size={20} className="shrink-0" />
            <span className="truncate">Continue: {nextLesson.title}</span>
          </Link>
        )}
        <button
          onClick={onBackToModules}
          className={`${BASE_BTN_CLASS} ${NEUTRAL_BTN_CLASS}`}
        >
          <span>Maybe Later</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
