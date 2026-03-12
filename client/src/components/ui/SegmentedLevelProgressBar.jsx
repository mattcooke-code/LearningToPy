// SegmentedLevelProgressBar.jsx - UPDATED for Course Complete State
import { useTheme } from "../../context";

const SegmentedLevelProgressBar = ({
  currentLevel = 1, // Modules completed (1–20)
  currentModule = null, // { order, title, lessonCount, lessonsCompleted }
  lessonsCompleted = 0, // Lessons completed in current module
  totalLessons = 0, // Total lessons in current module
  showLabels = true,
}) => {
  const { getModuleThemeColor } = useTheme();

  // 🎉 COURSE COMPLETE: Level 20 = all segments filled
  const isCourseComplete = currentLevel >= 20;

  // Determine segment count (default to 6 if no module data)
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

  // Color based on phase (matches badge tiers)
  const getPhaseColor = (moduleOrder) => {
    if (!moduleOrder) return "#22c55e"; // Default green
    if (moduleOrder <= 9) return "#cd7f32"; // Bronze (Phase 1)
    if (moduleOrder <= 15) return "#c0c0c0"; // Silver (Phase 2)
    return "#ffd700"; // Gold (Phase 3)
  };

  const themeColor = isCourseComplete
    ? "#800080" // Gold for course complete
    : currentModule
      ? getPhaseColor(currentModule.order)
      : getModuleThemeColor(currentLevel);

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="text-sm font-medium text-gray-600">Course Level</p>
            <p className="text-2xl font-bold" style={{ color: themeColor }}>
              {isCourseComplete ? "🎉 Level 20" : `Level ${currentLevel}`}
            </p>
          </div>
          <div className="text-right">
            {isCourseComplete ? (
              <p className="text-sm text-green-600 font-medium">
                ✨ Course Complete!
              </p>
            ) : currentModule ? (
              <>
                <p className="text-sm text-gray-500">
                  Module {currentModule.order}: {currentModule.title}
                </p>
                <p className="text-xs text-gray-400">
                  {lessonsCompleted}/{totalLessons} lessons
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">Getting started...</p>
            )}
          </div>
        </div>
      )}

      {/* Segmented Progress Bar */}
      <div className="flex h-4 w-full space-x-0.5 rounded-full bg-gray-200 p-0.5">
        {Array.from({ length: segmentCount }).map((_, index) => {
          // Course complete = ALL segments filled (gold)
          const isCompleted = isCourseComplete
            ? true
            : index < lessonsCompleted;
          const isCurrent = !isCourseComplete && index === lessonsCompleted;

          return (
            <div
              key={index}
              className={`relative flex-1 overflow-hidden rounded-sm transition-all duration-300 ${
                isCurrent ? "ring-2 ring-offset-1" : ""
              }`}
              style={{
                backgroundColor: isCompleted ? themeColor : "transparent",
                borderColor: isCompleted ? themeColor : "#e5e7eb",
                borderWidth: "1px",
                ringColor: isCurrent ? themeColor : "transparent",
                opacity: isCompleted ? 1 : 0.5,
              }}
              title={
                isCourseComplete
                  ? `Module ${index + 1} ✓`
                  : `Lesson ${index + 1}`
              }
            />
          );
        })}
      </div>

      {/* Phase Indicator */}
      {showLabels && (
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>
            {isCourseComplete
              ? "🏆 All Phases Complete"
              : currentModule
                ? currentModule.order <= 9
                  ? "🥉 Phase 1: Fundamentals"
                  : currentModule.order <= 15
                    ? "🥈 Phase 2: Intermediate"
                    : "🥇 Phase 3: Advanced"
                : "Get started to begin your journey"}
          </span>
          <span>{Math.round(progressPercentage)}% complete</span>
        </div>
      )}
    </div>
  );
};

export default SegmentedLevelProgressBar;
