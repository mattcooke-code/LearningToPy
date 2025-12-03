import { useTheme } from "../../context";
import { calculateLevelProgress } from "../../utils/progressCalculations";

const SegmentedLevelProgressBar = ({
  currentXP,
  segmentCount = 10,
  showLabels = true,
}) => {
  const { getModuleThemeColor } = useTheme();

  // Calculate level progress
  const {
    progressCompleted,
    currentLevel,
    xpInCurrentLevel,
    xpNeededForNextLevel,
  } = calculateLevelProgress(currentXP);

  const segmentWidth = 100 / segmentCount;
  const filledSegments = Math.floor(progressCompleted / segmentWidth);
  const partialFill = (progressCompleted % segmentWidth) / segmentWidth;

  // Generate colors for segments (similar to ProgressGauge gradient)
  const getSegmentColor = (segmentIndex) => {
    // Color progression: Red → Orange → Yellow → Green
    const segmentProgress = ((segmentIndex + 1) / segmentCount) * 100;

    if (segmentProgress <= 25) return "#ef4444"; // Red
    if (segmentProgress <= 45) return "#f97316"; // Orange
    if (segmentProgress <= 65) return "#FFD700"; // Yellow
    if (segmentProgress <= 85) return "#84cc16"; // Lime
    return "#22c55e"; // Green
  };

  return (
    <div className="w-full">
      {showLabels && (
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-gray-700">
              Level {currentLevel}
            </span>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-800">
              {xpInCurrentLevel}/100 XP
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-gray-900">
              {progressCompleted}%
            </span>
            <span className="ml-2 text-xs text-gray-500">Complete</span>
          </div>
        </div>
      )}

      {/* Segmented Progress Bar */}
      <div className="flex h-6 w-full space-x-1 rounded-full bg-gray-200 p-1">
        {Array.from({ length: segmentCount }).map((_, index) => {
          const isFilled = index < filledSegments;
          const isPartiallyFilled = index === filledSegments;
          const segmentColor = getSegmentColor(index);

          return (
            <div
              key={index}
              className="relative flex-1 overflow-hidden rounded-full transition-all duration-300"
              style={{
                backgroundColor: isFilled ? segmentColor : "transparent",
                border: `2px solid ${isFilled ? segmentColor : "#e5e7eb"}`,
              }}
            >
              {/* Partial fill for current segment */}
              {isPartiallyFilled && (
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${partialFill * 100}%`,
                    backgroundColor: segmentColor,
                  }}
                />
              )}

              {/* Segment number (optional) */}
              {showLabels && (
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* XP Details */}
      {showLabels && (
        <div className="mt-3 flex justify-between text-xs">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-gray-600">Beginner (0-25%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="text-gray-600">Intermediate (26-65%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-gray-600">Advanced (66-100%)</span>
            </div>
          </div>

          <div className="text-right">
            <p className="font-medium text-gray-700">
              {xpNeededForNextLevel} XP to next level
            </p>
            <p className="text-sm text-gray-500">
              {xpInCurrentLevel} XP earned this level
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SegmentedLevelProgressBar;
