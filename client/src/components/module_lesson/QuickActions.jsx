// components/QuickActions.jsx
import { Link } from "react-router-dom";
import { PlayCircle } from "lucide-react";

const QuickActions = ({ lessons, moduleId, accentColor, onBackToModules }) => {
  const nextLesson = lessons.find((lesson) => !lesson.isCompleted);

  return (
    <div className="mt-8 bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Ready to continue?
      </h3>
      <div className="flex flex-wrap gap-4">
        {nextLesson ? (
          <Link
            to={`/lessons/${nextLesson._id}`}
            className="flex items-center space-x-2 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition"
            style={{ backgroundColor: accentColor }}
          >
            <PlayCircle size={20} />
            <span>Continue with Next Lesson</span>
          </Link>
        ) : (
          <div className="text-green-600 font-semibold">
            🎉 All lessons completed! Great job!
          </div>
        )}

        <button
          onClick={onBackToModules}
          className="flex items-center space-x-2 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition"
        >
          <span>Back to All Modules</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
