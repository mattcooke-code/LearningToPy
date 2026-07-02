// /components/analytics/MetricsGrid.jsx
import { useMemo } from "react";
import { Users, TrendingUp, Target, BookOpen } from "lucide-react";

// HELPERS
const METRIC_COLORS = {
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/20",
    icon: "text-blue-600 dark:text-blue-400",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-900/20",
    icon: "text-green-600 dark:text-green-400",
  },
  yellow: {
    bg: "bg-yellow-100 dark:bg-yellow-900/20",
    icon: "text-yellow-600 dark:text-yellow-400",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/20",
    icon: "text-purple-600 dark:text-purple-400",
  },
};

/**
 * Grid component displaying key platform metrics with icons and trend indicators.
 * Shows daily active users, session duration, total XP, and lessons completed.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.platformMetrics - Platform metrics data object
 * @param {number} props.platformMetrics.dailyActiveUsers - Number of daily active users
 * @param {number} props.platformMetrics.avgSessionDuration - Average session duration in minutes
 * @param {number} props.platformMetrics.totalXP - Total XP earned across platform
 * @param {number} props.platformMetrics.totalLessonsCompleted - Total lessons completed
 * @returns {JSX.Element|null} Metrics grid or null if no data provided
 */
export const MetricsGrid = ({ platformMetrics }) => {
  if (!platformMetrics) return null;

  const metrics = useMemo(
    () => [
      {
        icon: Users,
        label: "Daily Active",
        value: platformMetrics.dailyActiveUsers?.toLocaleString() || "0",
        change: "+12%",
        color: "blue",
      },
      {
        icon: TrendingUp,
        label: "Avg Session",
        value: `${platformMetrics.avgSessionDuration || 0}m`,
        change: "+2m",
        color: "green",
      },
      {
        icon: Target,
        label: "Total XP",
        value: platformMetrics.totalXP?.toLocaleString() || "0",
        change: "+5%",
        color: "yellow",
      },
      {
        icon: BookOpen,
        label: "Lessons Completed",
        value: platformMetrics.totalLessonsCompleted?.toLocaleString() || "0",
        change: "+8%",
        color: "purple",
      },
    ],
    [platformMetrics],
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`p-2 rounded-lg ${METRIC_COLORS[metric.color].bg}`}
              >
                <Icon
                  className={`h-5 w-5 ${METRIC_COLORS[metric.color].icon}`}
                  aria-hidden="true"
                />
              </div>
              {/* FIXED: text-green-600 → text-green-700 for contrast */}
              <span className="text-xs font-medium text-green-700 dark:text-green-400">
                {metric.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metric.value}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {metric.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

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
      {/* FIXED: h4 → h3 for proper heading hierarchy */}
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
              {/* FIXED: text-green-600 → text-green-700 for contrast */}
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
