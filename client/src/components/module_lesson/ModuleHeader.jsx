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
        {/* Change: added flex-col and md:flex-row */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left space-y-4 md:space-y-0 md:space-x-4">
            <div
              className="text-5xl md:text-4xl"
              style={{ color: accentColor }}
            >
              {moduleData.icon || "📚"}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                {moduleData.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">
                {moduleData.description}
              </p>
            </div>
          </div>
          {/* Progress Circle - center it on mobile */}
          <div className="shrink-0">
            <ProgressCircle
              progress={moduleLessonProgress}
              completedLessons={completedLessons}
              totalLessons={totalLessons}
              accentColor={accentColor}
            />
          </div>{" "}
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
