import { useTheme } from "../../context";

const SegmentedLevelProgressBar = ({
  currentLevel = 1, // Modules completed (1–20)
  currentModule = null, // { order, title, lessonCount, lessonsCompleted }
  lessonsCompleted = 0, // Lessons completed in current module
  totalLessons = 0, // Total lessons in current module
  showLabels = true,
}) => {
  const { getModuleThemeColor } = useTheme();

  // --- LOGIC FROM NEW VERSION ---
  const isCourseComplete = currentLevel >= 20;

  // If course complete, show 20 blocks. Otherwise, one block per lesson.
  const segmentCount = isCourseComplete
    ? 20
    : totalLessons > 0
      ? totalLessons
      : 6;

  const progressPercentage = isCourseComplete
    ? 100
    : totalLessons > 0
      ? (lessonsCompleted / totalLessons) * 100
      : 0;

  // --- STYLE FROM OLD VERSION ---
  // Restoring the vibrant color progression
  const getSegmentColor = (index) => {
    if (isCourseComplete) return "#800080"; // Purple/Gold for total completion

    const segmentProgress = ((index + 1) / segmentCount) * 100;
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
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-700">
              {isCourseComplete
                ? "🎉 Course Complete"
                : `Level ${currentLevel}`}
            </span>
            {!isCourseComplete && currentModule && (
              <span className="text-xs text-gray-500">
                Module {currentModule.order}: {currentModule.title}
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-gray-900">
              {Math.round(progressPercentage)}%
            </span>
            <span className="ml-1 text-xs text-gray-500">Complete</span>
          </div>
        </div>
      )}

      {/* Segmented Progress Bar - Restored to Old Styling */}
      <div className="flex h-6 w-full space-x-1 rounded-full bg-gray-200 p-1">
        {Array.from({ length: segmentCount }).map((_, index) => {
          const isFilled = isCourseComplete || index < lessonsCompleted;
          const segmentColor = getSegmentColor(index);

          return (
            <div
              key={index}
              className="relative flex-1 overflow-hidden rounded-full transition-all duration-300"
              style={{
                backgroundColor: isFilled ? segmentColor : "transparent",
                border: `2px solid ${isFilled ? segmentColor : "#e5e7eb"}`,
              }}
              title={
                isCourseComplete
                  ? `Module ${index + 1} ✓`
                  : `Lesson ${index + 1}`
              }
            >
              {/* Optional: Segment Number (Old style had this) */}
              {showLabels && segmentCount <= 12 && (
                <span
                  className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${isFilled ? "text-white" : "text-gray-400"}`}
                >
                  {index + 1}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Labels - Merged Context */}
      {showLabels && (
        <div className="mt-3 flex justify-between text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-gray-500">Start</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-gray-500">Finish</span>
            </div>
          </div>

          <div className="text-right font-medium text-gray-600">
            {isCourseComplete
              ? "🏆 20/20 Modules Mastered"
              : `${lessonsCompleted} / ${totalLessons} Lessons`}
          </div>
        </div>
      )}
    </div>
  );
};

export default SegmentedLevelProgressBar;
