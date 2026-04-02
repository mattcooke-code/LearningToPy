// components/ModulesStats.jsx
import { useTheme } from "../../context";

const ModulesStats = ({ totalModules, completedModules, userXP }) => {
  const { themeColor } = useTheme();

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 m-2 text-center">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
        <div>
          <div className="text-2xl font-bold" style={{ color: themeColor }}>
            {totalModules}
          </div>
          <div className="text-gray-600 dark:text-gray-300">Total Modules</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-500">
            {completedModules}
          </div>
          <div className="text-gray-600 dark:text-gray-300">Completed</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-python-yellow">
            {userXP || 0}
          </div>
          <div className="text-gray-600 dark:text-gray-300">Total XP</div>
        </div>
      </div>
    </div>
  );
};

export default ModulesStats;
