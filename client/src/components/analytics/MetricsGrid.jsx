// /components/analytics/MetricsGrid.jsx
import { Users, TrendingUp, Target, BookOpen } from "lucide-react";

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

  const metrics = [
    {
      icon: Users,
      label: "Daily Active",
      value: platformMetrics.dailyActiveUsers?.toLocaleString() || "0",
      change: "+12%", // You could calculate this dynamically
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
  ];

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
                className={`p-2 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/20`}
              >
                <Icon
                  className={`h-5 w-5 text-${metric.color}-600 dark:text-${metric.color}-400`}
                />
              </div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
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
