// components/./ProgressCircle.jsx

/**
 * ProgressCircle component for displaying circular progress
 * @param {number} progress - The progress percentage (0-100)
 * @param {number} completedLessons - Number of completed lessons
 * @param {number} totalLessons - Total number of lessons
 * @param {string} accentColor - Color for the progress circle
 */

const ProgressCircle = ({
  progress,
  completedLessons,
  totalLessons,
  accentColor,
}) => {
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
            strokeDasharray={226.2}
            strokeDashoffset={226.2 - (progress / 100) * 226.2}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color: accentColor }}>
            {progress}%
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        {completedLessons}/{totalLessons} lessons
      </p>
    </div>
  );
};

export default ProgressCircle;
