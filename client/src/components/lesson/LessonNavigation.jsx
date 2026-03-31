// LessonNavigation.jsx
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  RefreshCw,
  Trophy,
} from "lucide-react";

const LessonNavigation = ({
  nextLesson,
  lesson,
  isReviewMode,
  themeColor,
  module,
  lessonFullyCompleted,
}) => {
  const isLastLessonOfModule = !nextLesson && lessonFullyCompleted;
  const moduleQuizExists =
    module?.moduleQuiz && module.moduleQuiz.questions?.length > 0;
  const moduleQuizCompleted = module?.quizCompleted || false;

  return (
    <div className="flex justify-between items-center">
      <Link
        to={`/modules/${module._id}/lessons`}
        style={{ backgroundColor: themeColor }}
        className="flex items-center space-x-2 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
      >
        <ArrowLeft size={20} />
        <span>Back To Module</span>
      </Link>

      {/* Next Lesson button  */}
      {nextLesson && lessonFullyCompleted && (
        <Link
          to={`/lessons/${nextLesson._id}`}
          style={{ backgroundColor: themeColor }}
          className="flex items-center space-x-2 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          <span>Next Lesson</span>
          <ArrowRight size={20} />
        </Link>
      )}

      {/* Module Quiz Button */}
      {isLastLessonOfModule && moduleQuizExists && !moduleQuizCompleted && (
        <Link
          to={`/modules/${lesson.moduleId}/quiz`}
          style={{ backgroundColor: themeColor }}
          className="flex items-center space-x-2 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition shadow-lg"
        >
          <Trophy size={20} />
          <span>Take Module Quiz</span>
          <ArrowRight size={20} />
        </Link>
      )}

      {/* Module Complete */}
      {isLastLessonOfModule && moduleQuizCompleted && (
        <div className="text-green-600 font-semibold flex items-center space-x-2">
          <CheckCircle size={20} />
          <span>Module Completed! 🎉</span>
        </div>
      )}

      {/* Lesson Completed - only shows when no next lesson available */}
      {lessonFullyCompleted && !nextLesson && !moduleQuizExists && (
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
