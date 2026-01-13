// QuickActions.jsx
import { Link } from "react-router-dom";
import { PlayCircle, Award, CheckCircle } from "lucide-react";

const QuickActions = ({
  lessons,
  moduleId,
  accentColor,
  onBackToModules,
  quizCompleted,
}) => {
  const nextLesson = lessons.find((lesson) => !lesson.isCompleted);
  const allLessonsDone = lessons.length > 0 && !nextLesson;

  // State 1: Module fully completed (Lessons + Quiz)
  if (allLessonsDone && quizCompleted) {
    return (
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full text-green-600 mb-3">
          <CheckCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">
          Module Mastered!
        </h3>
        <p className="text-green-700 mb-6">
          You've completed every lesson and passed the final quiz.
        </p>
        <button
          onClick={onBackToModules}
          className="bg-green-600 text-white py-3 px-8 rounded-lg font-bold hover:bg-green-700 transition shadow-sm"
        >
          Explore Next Modules
        </button>
      </div>
    );
  }

  // State 2: Ready for the Final Quiz
  if (allLessonsDone && !quizCompleted) {
    return (
      <div className="mt-8 bg-indigo-50 border-2 border-indigo-100 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-600 rounded-lg text-white shadow-lg">
              <Award size={30} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Final Challenge Unlocked
              </h3>
              <p className="text-gray-600">
                Complete the {lessons.length}-question review to finish the
                module.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/modules/${moduleId}/quiz`}
              className="flex items-center space-x-2 bg-indigo-600 text-white py-3 px-8 rounded-lg font-bold hover:bg-indigo-700 transition transform hover:scale-105"
            >
              <span>Take Final Quiz</span>
            </Link>
            <button
              onClick={onBackToModules}
              className="text-gray-600 px-4 py-2 hover:underline font-medium"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Standard "Continue" (Current behavior)
  return (
    <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Ready to continue?
      </h3>
      <div className="flex flex-wrap gap-4">
        {nextLesson && (
          <Link
            to={`/lessons/${nextLesson._id}`}
            className="flex items-center space-x-2 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition shadow-sm"
            style={{ backgroundColor: accentColor }}
          >
            <PlayCircle size={20} />
            <span>Continue: {nextLesson.title}</span>
          </Link>
        )}

        <button
          onClick={onBackToModules}
          className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          <span>Back to All Modules</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
