// ModulesHeader.jsx
import { useTheme } from "../../context";
import { calculateModulesCompletionProgress } from "../../utils";

/**
 * Header component for the modules page displaying learning path title and progress.
 * @component
 * @param {Object} props
 * @param {number} props.completedModules - Number of modules completed by the user
 * @param {number} props.totalModules - Total number of modules available
 */

const ModulesHeader = ({ completedModules, totalModules }) => {
  const { themeColor, themeTextColor } = useTheme();

  const modulesCompletionProgress = calculateModulesCompletionProgress(
    completedModules,
    totalModules,
  );

  return (
    <div className="text-center mb-8 px-3">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Your Learning Path
      </h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Master Python step by step. Complete modules in order to unlock advanced
        topics and earn XP along the way!
      </p>

      {/* Progress Overview */}
      <div className="mt-6  rounded-lg shadow-md p-6 max-w-md mx-auto bg-python-blue text-white">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium ">Modules Completion</span>

          <span className="text-sm font-extrabold">
            {modulesCompletionProgress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:text-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-500 "
            style={{
              width: `${modulesCompletionProgress}%`,
              backgroundColor: themeColor,
            }}
          ></div>
        </div>
        <p className="text-xs  mt-2">
          {completedModules} of {totalModules} modules completed
        </p>
      </div>
    </div>
  );
};

export default ModulesHeader;
