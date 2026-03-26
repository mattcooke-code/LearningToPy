// components/ModuleHeader.jsx
import { ArrowLeft } from "lucide-react";
import ProgressCircle from "./ProgressCircle";

const ModuleHeader = ({
  moduleData,
  completedLessons,
  totalLessons,
  moduleLessonProgress,
  accentColor,
  onBack,
}) => {
  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:hover:text-python-yellow transition mb-4"
      >
        <ArrowLeft size={20} />
        <span>Back to Modules</span>
      </button>

      {/* Module Header */}
      <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="text-4xl" style={{ color: accentColor }}>
              {moduleData.icon || "📚"}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                {moduleData.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {moduleData.description}
              </p>
            </div>
          </div>

          {/* Progress Circle */}
          <ProgressCircle
            progress={moduleLessonProgress}
            completedLessons={completedLessons}
            totalLessons={totalLessons}
            accentColor={accentColor}
          />
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
            <span>Module Progress</span>
            <span>{moduleLessonProgress}% Complete</span>
          </div>
          <div className="w-full bg-gray-200  rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{
                width: `${moduleLessonProgress}%`,
                backgroundColor: accentColor,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleHeader;
