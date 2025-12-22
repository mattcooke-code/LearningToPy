// components/ModulesHeader.jsx
import { useTheme } from "../../context";
import { calculateModulesCompletionProgress } from "../../utils";

const ModulesHeader = ({ completedModules, totalModules }) => {
  const { themeColor } = useTheme();

  const modulesCompletionProgress = calculateModulesCompletionProgress(
    completedModules,
    totalModules
  );

  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Your Learning Path
      </h1>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Master Python step by step. Complete modules in order to unlock advanced
        topics and earn XP along the way!
      </p>

      {/* Progress Overview */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Modules Completion
          </span>
          <span className="text-sm font-bold" style={{ color: themeColor }}>
            {modulesCompletionProgress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{
              width: `${modulesCompletionProgress}%`,
              backgroundColor: themeColor,
            }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {completedModules} of {totalModules} modules completed
        </p>
      </div>
    </div>
  );
};

export default ModulesHeader;
