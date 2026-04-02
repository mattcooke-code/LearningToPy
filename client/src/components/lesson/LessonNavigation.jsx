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
    <div className="mt-8 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4">
      {/* Back Button */}
      <Link
        to={`/modules/${module._id}/lessons`}
        style={{ backgroundColor: themeColor }}
        className="flex items-center justify-center space-x-2 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition shadow-md w-full sm:w-auto order-2 sm:order-1"
      >
        <ArrowLeft size={20} />
        <span>Back To Module</span>
      </Link>

      {/* Next Lesson / Quiz Button Group */}
      <div className="flex flex-col w-full sm:w-auto order-1 sm:order-2">
        {nextLesson && lessonFullyCompleted && (
          <Link
            to={`/lessons/${nextLesson._id}`}
            style={{ backgroundColor: themeColor }}
            className="flex items-center justify-center space-x-2 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition shadow-lg w-full"
          >
            <span>Next Lesson</span>
            <ArrowRight size={20} />
          </Link>
        )}

        {isLastLessonOfModule && moduleQuizExists && !moduleQuizCompleted && (
          <Link
            to={`/modules/${lesson.moduleId}/quiz`}
            style={{ backgroundColor: themeColor }}
            className="flex items-center justify-center space-x-2 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition shadow-lg w-full"
          >
            <Trophy size={20} />
            <span>Take Module Quiz</span>
            <ArrowRight size={20} />
          </Link>
        )}

        {/* Completion Indicators */}
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

export default LessonNavigation;
