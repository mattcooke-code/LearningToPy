import { calculateLevelProgress } from "../../utils";
import { useTheme } from "../../context";

const LevelProgressBar = ({ currentXP, showDetails = true }) => {
  const { themeColor } = useTheme();

  const {
    currentLevel,
    xpInCurrentLevel,
    progressToNextLevel,
    xpNeededForNextLevel,
  } = calculateLevelProgress(currentXP);

  return (
    <div className="w-full">
      {showDetails && (
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              Level {currentLevel}
            </span>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
              {xpInCurrentLevel}/100 XP
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-gray-900">
              {progressToNextLevel}%
            </span>
            <span className="ml-2 text-xs text-gray-500">
              to Level {currentLevel + 1}
            </span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
        {/* Animated fill */}
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progressToNextLevel}%`,
            backgroundColor: themeColor,
          }}
        />

        {/* XP milestone markers (optional - shows every 25 XP) */}
        {showDetails && (
          <div className="absolute inset-0 flex justify-between px-1">
            {[25, 50, 75].map((milestone) => (
              <div
                key={milestone}
                className="h-3 w-0.5 bg-white/50"
                style={{ marginLeft: `${milestone}%` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* XP details (optional) */}
      {showDetails && (
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span className="font-medium">
            {xpInCurrentLevel} XP earned this level
          </span>
          <span className="font-semibold text-python-yellow">
            {xpNeededForNextLevel} XP to next level
          </span>
        </div>
      )}

      {/* Compact version for small spaces */}
      {!showDetails && (
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className="font-medium text-gray-600">
            Lvl {currentLevel} • {progressToNextLevel}%
          </span>
          <span className="font-semibold text-python-yellow">
            {xpNeededForNextLevel} XP needed
          </span>
        </div>
      )}
    </div>
  );
};

export default LevelProgressBar;
