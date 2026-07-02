// /components/analytics/UserSegmentation.jsx

// HELPERS
const SEGMENT_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
];

/**
 * Component displaying user segmentation with visual progress bars and statistics.
 * Shows user segments with counts, percentages, and average metrics per segment.
 *
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.userSegments - Array of user segment data
 * @param {string} props.userSegments[].segment - Segment name/identifier
 * @param {number} props.userSegments[].count - Number of users in segment
 * @param {number} props.userSegments[].avgLevel - Average level for users in segment
 * @param {number} props.userSegments[].avgXP - Average XP for users in segment
 * @param {Object} [props.platformMetrics] - Platform metrics for percentage calculation
 * @param {number} [props.platformMetrics.monthlyActiveUsers] - Total monthly active users
 * @returns {JSX.Element|null} User segmentation display or null if no data provided
 */
export const UserSegmentation = ({ userSegments, platformMetrics }) => {
  if (!userSegments?.length) return null;

  const totalUsers =
    platformMetrics?.monthlyActiveUsers ||
    userSegments.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      {/* FIXED: h4 → h3 for proper heading hierarchy */}
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        User Segmentation
      </h3>
      <div className="space-y-4">
        {userSegments.map((segment, index) => {
          const percentage =
            totalUsers > 0 ? (segment.count / totalUsers) * 100 : 0;

          return (
            <div key={segment.segment} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {segment.segment}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {segment.count?.toLocaleString() || 0} users (
                  {percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${SEGMENT_COLORS[index % SEGMENT_COLORS.length]} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                  role="progressbar"
                  aria-valuenow={percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${segment.segment}: ${percentage.toFixed(1)}%`}
                ></div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Avg Level: {segment.avgLevel || 0} • Avg XP:{" "}
                {segment.avgXP?.toLocaleString() || 0}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
