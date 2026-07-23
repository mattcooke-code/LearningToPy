// LessonNavigation.jsx
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  RefreshCw,
  Trophy,
} from "lucide-react";

/**
 * @fileoverview
 * Navigation component for lesson progression with module completion logic.
 * This component manages the navigation flow between lessons and modules, handling
 * completion states, quiz availability, and progress tracking. Features conditional
 * rendering based on lesson completion, module quiz access, and overall module
 * progress. Integrates with parent components for seamless learning flow.
 */

/**
 * Navigation component for lesson progression with module completion logic.
 *
 * This component handles the navigation flow within lessons and modules, determining
 * the appropriate next steps based on completion status and quiz availability.
 * Manages the transition between lessons, access to module quizzes, and completion
 * indicators. The component integrates with the overall module progress system
 * to provide appropriate navigation options and visual feedback.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.nextLesson - Next lesson data or null if no next lesson
 * @param {Object} props.lesson - Current lesson data
 * @param {boolean} props.isReviewMode - Whether in review mode
 * @param {string} props.themeColor - Theme bg color for styling
 * @param {string} props.themeTextColor - Theme text color for styling
 * @param {Object} props.module - Current module data with quiz information
 * @param {boolean} props.lessonFullyCompleted - Whether current lesson is fully completed
 * @returns {JSX.Element} Navigation interface with conditional buttons and indicators
 *
 * @interComponentLogic
 * - Receives lessonFullyCompleted from parent lesson components
 * - Checks module.quizCompleted for module-wide progress tracking
 * - Determines navigation flow based on completion states
 * - Integrates with module quiz system for progression
 * - Provides visual feedback for completion status
 *
 * @navigationFlow
 * 1. Check if lesson is fully completed
 * 2. Determine if this is the last lesson of the module
 * 3. Check if module quiz exists and is not completed
 * 4. Show appropriate navigation options:
 *    - Next lesson button (if lesson completed and next lesson exists)
 *    - Module quiz button (if last lesson and quiz available)
 *    - Completion indicators (if module/lesson completed)
 * 5. Always show "Back to Module" button for navigation
 *
 * @completionStates
 * - Lesson completed with next lesson available: Show "Next Lesson" button
 * - Last lesson completed with quiz available: Show "Take Module Quiz" button
 * - Module quiz completed: Show "Module Completed!" indicator
 * - No quiz available and last lesson: Show "Lesson Completed!" indicator
 * - Review mode: Standard navigation without completion tracking
 *
 * @progressIntegration
 * - lessonFullyCompleted prop from parent lesson component
 * - module.quizCompleted for module-wide progress tracking
 * - Conditional rendering based on completion states
 * - Visual indicators for user progress feedback
 * - Seamless integration with overall learning flow
 *
 * @responsiveDesign
 * - Mobile-friendly button layout with flex reordering
 * - Adaptive spacing for different screen sizes
 * - Touch-friendly button sizes and spacing
 * - Consistent theming with theme color integration
 */

const LessonNavigation = ({
  nextLesson,
  lesson,
  isReviewMode,
  module,
  lessonFullyCompleted,
}) => {
  const isLastLessonOfModule = !nextLesson && lessonFullyCompleted;
  const moduleQuizExists =
    module?.moduleQuiz && module.moduleQuiz.questions?.length > 0;
  const moduleQuizCompleted = module?.quizCompleted || false;

  return (
    <div className="mt-8 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4">
      {/* Back Button — use Tailwind theme classes */}
      <Link
        to={`/modules/${module?._id}/lessons`}
        className="flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition shadow-md w-full sm:w-auto order-2 sm:order-1 bg-theme hover:bg-theme-hover text-theme-text"
      >
        <ArrowLeft size={20} />
        <span>Back To Module</span>
      </Link>

      <div className="flex flex-col w-full sm:w-auto order-1 sm:order-2">
        {nextLesson && lessonFullyCompleted && (
          <Link
            to={`/lessons/${nextLesson._id}`}
            className="flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition shadow-lg w-full bg-theme hover:bg-theme-hover text-theme-text"
          >
            <span>Next Lesson</span>
            <ArrowRight size={20} />
          </Link>
        )}

        {isLastLessonOfModule && moduleQuizExists && !moduleQuizCompleted && (
          <Link
            to={`/modules/${lesson.moduleId}/quiz`}
            className="flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition shadow-lg w-full bg-theme hover:bg-theme-hover text-theme-text"
          >
            <Trophy size={20} />
            <span>Take Module Quiz</span>
            <ArrowRight size={20} />
          </Link>
        )}

        {isLastLessonOfModule && !moduleQuizExists && (
          <Link
            to={`/dashboard`}
            className="flex items-center justify-center space-x-2 text-python-light bg-purple-900 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition shadow-lg w-full"
          >
            <span>Course Complete</span>
            <Trophy size={20} />
          </Link>
        )}

        {(moduleQuizCompleted ||
          (!nextLesson && !moduleQuizExists && lessonFullyCompleted)) && (
          <div className="flex items-center justify-center sm:justify-end space-x-2 text-green-600 font-bold py-2">
            <CheckCircle size={20} />
            <span>
              {moduleQuizCompleted
                ? "Module Completed! 🎉"
                : "Lesson Completed!"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
