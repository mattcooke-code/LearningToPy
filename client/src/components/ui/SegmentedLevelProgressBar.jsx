/**
 * A segmented progress bar showing course completion with level and lesson tracking.
 *
 * This component displays progress through a 20-level course with individual lesson
 * tracking within each module. It uses color-coded segments to indicate progress
 * and handles both active course completion and finished course states.
 *
 * @component
 * @example
 * ```jsx
 * <SegmentedLevelProgressBar
 *   currentLevel={5}
 *   currentModule={{ order: 5, title: "Functions", lessonCount: 8, lessonsCompleted: 3 }}
 *   lessonsCompleted={3}
 *   totalLessons={8}
 *   showLabels={true}
 * />
 * ```
 *
 * @param {Object} props - Component props
 * @param {number} [props.currentLevel=1] - Current level number (1-20, representing completed modules)
 * @param {Object|null} [props.currentModule=null] - Current module information object
 * @param {number} props.currentModule.order - Module order number
 * @param {string} props.currentModule.title - Module display title
 * @param {number} props.currentModule.lessonCount - Total number of lessons in this module
 * @param {number} props.currentModule.lessonsCompleted - Number of lessons completed in this module
 * @param {number} [props.lessonsCompleted=0] - Number of lessons completed in current module
 * @param {number} [props.totalLessons=0] - Total number of lessons in current module
 * @param {boolean} [props.showLabels=true] - Whether to show header labels and footer information
 *
 * @returns {JSX.Element} A segmented progress bar with labels and color coding
 *
 * @progressLogic
 * - Course Complete (level 20+): Shows 20 purple segments with completion message
 * - Active Course: Shows segments equal to lesson count (minimum 6)
 * - Each segment represents one lesson within the current module
 * - Progress percentage calculated from completed lessons vs total lessons
 *
 * @colorScheme
 * Segment colors based on progress position:
 * - 0-25%: Red (#ef4444) - Beginning stages
 * - 25-45%: Orange (#f97316) - Early progress
 * - 45-65%: Yellow (#FFD700) - Mid progress
 * - 65-85%: Lime (#84cc16) - Advanced progress
 * - 85-100%: Green (#22c55e) - Near completion
 * - Course Complete: Purple (#800080) - Mastery achieved
 *
 * @visualFeatures
 * - Segmented bar with rounded corners and spacing
 * - Filled segments use color, empty segments show only borders
 * - Optional segment numbers (shown when ≤12 segments)
 * - Hover tooltips showing lesson/module information
 * - Smooth color transitions (300ms duration)
 *
 * @labelInformation
 * Header shows:
 * - Current level or "Course Complete" with celebration emoji
 * - Current module title and order (if active)
 * - Progress percentage and completion status
 *
 * Footer shows:
 * - Start/Finish color indicators
 * - Lesson count or mastery status
 * - Additional context information
 *
 * @responsiveBehavior
 * - Segment numbers hidden when >12 segments (crowding prevention)
 * - Labels can be toggled for compact display
 * - Maintains readability across different screen sizes
 */

const getSegmentColor = (index, segmentCount, isCourseComplete) => {
  if (isCourseComplete) return "#800080";
  const segmentProgress = ((index + 1) / segmentCount) * 100;
  if (segmentProgress <= 25) return "#ef4444";
  if (segmentProgress <= 45) return "#f97316";
  if (segmentProgress <= 65) return "#FFD700";
  if (segmentProgress <= 85) return "#84cc16";
  return "#22c55e";
};

const SegmentedLevelProgressBar = ({
  currentLevel = 1,
  currentModule = null,
  lessonsCompleted = 0,
  totalLessons = 0,
  showLabels = true,
}) => {
  const isCourseComplete = currentLevel >= 20;

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

  return (
    <div className="w-full">
      {showLabels && (
        <div className="mb-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {isCourseComplete
                ? "🎉 Course Complete"
                : `Level ${currentLevel}`}
            </span>
            {!isCourseComplete && currentModule && (
              <span className="text-xs text-gray-500 dark:text-gray-200">
                Module {currentModule.order}: {currentModule.title}
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {Math.round(progressPercentage)}%
            </span>
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-300">
              Complete
            </span>
          </div>
        </div>
      )}

      {/* Segmented Progress Bar - Restored to Old Styling */}
      <div className="flex h-6 w-full space-x-1 rounded-full bg-gray-200 dark:bg-gray-700 p-1">
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
              {/* Optional: Segment Number */}
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
              <span className="text-gray-500 dark:text-gray-300">Start</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-gray-500 dark:text-gray-300">Finish</span>
            </div>
          </div>

          <div className="text-right font-medium text-gray-600 dark:text-gray-300">
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
