// UserSegmentation.jsx
export const UserSegmentation = ({ userSegments, platformMetrics }) => {
  if (!userSegments) return null;

  const COLORS = ["bg-blue-500", "bg-green-500", "bg-purple-500"];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        User Segmentation
      </h4>
      <div className="space-y-4">
        {userSegments.map((segment, index) => {
          const percentage = platformMetrics?.monthlyActiveUsers
            ? (segment.count / platformMetrics.monthlyActiveUsers) * 100
            : 0;

          return (
            <div key={segment.segment} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {segment.segment}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {segment.count?.toLocaleString() || "0"} users (
                  {percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${COLORS[index]} rounded-full`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Average Level: {segment.avgLevel || 0} • Average XP:{" "}
                {(segment.avgLevel * 100).toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
