/**
 * Circular progress indicator showing lesson completion percentage.
 * @component
 * @param {Object} props
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {number} props.completedLessons - Number of completed lessons
 * @param {number} props.totalLessons - Total number of lessons
 * @param {string} props.accentColor - Color for the progress circle stroke
 */

const ProgressCircle = ({
  progress,
  completedLessons,
  totalLessons,
  accentColor,
}) => {
  // SVG circumference: 2 * π * 36 ≈ 226.2
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="text-center">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke={accentColor}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color: accentColor }}>
            {progress}%
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
        {completedLessons}/{totalLessons} lessons
      </p>
    </div>
  );
};

export default ProgressCircle;