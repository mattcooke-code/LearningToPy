/**
 * Component displaying top performing content with rankings and performance metrics.
 * Shows content title, difficulty, starts, completions, and completion rates.
 *
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.contentPerformance - Array of content performance data
 * @param {string} props.contentPerformance[]._id - Content identifier
 * @param {string} props.contentPerformance[].title - Content title
 * @param {string} props.contentPerformance[].difficulty - Content difficulty level
 * @param {number} props.contentPerformance[].starts - Number of times content was started
 * @param {number} props.contentPerformance[].completions - Number of times content was completed
 * @param {number} props.contentPerformance[].completionRate - Completion rate percentage
 * @returns {JSX.Element|null} Top content list or null if no data provided
 */

export const TopContent = ({ contentPerformance }) => {
  if (!contentPerformance?.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 sm:p-6">
      {/* Change h4 to h3 */}
      <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4">
        Top Performing Content
      </h3>
      <div className="space-y-3 sm:space-y-4">
        {contentPerformance.slice(0, 5).map((item, index) => (
          <div
            key={item._id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg gap-3 sm:gap-4"
          >
            <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
              <div className="text-lg font-bold text-gray-400 shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base break-words">
                  {item.title}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-0">
                  Difficulty: {item.difficulty || "N/A"} • {item.starts || 0}{" "}
                  {item.starts === 1 ? "start" : "starts"}
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right ml-8 sm:ml-0">
              <div className="font-medium text-sm sm:text-base dark:text-gray-200">
                {item.completions?.toLocaleString() || 0} completions
              </div>
              {/* Fixed color contrast */}
              <div className="text-xs sm:text-sm text-green-700 dark:text-green-400">
                {item.completionRate?.toFixed(1)}% completion rate
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
