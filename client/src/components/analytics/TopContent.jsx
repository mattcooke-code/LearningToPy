// /components/analytics/TopContent.jsx
export const TopContent = ({ contentPerformance }) => {
  if (!contentPerformance?.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Top Performing Content
      </h4>
      <div className="space-y-4">
        {contentPerformance.slice(0, 5).map((item, index) => (
          <div
            key={item._id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="text-lg font-bold text-gray-400">{index + 1}</div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {item.title}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Difficulty: {item.difficulty || "N/A"} • {item.starts || 0}{" "}
                  starts
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">
                {item.completions?.toLocaleString() || 0} completions
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                {item.completionRate?.toFixed(1)}% completion rate
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
