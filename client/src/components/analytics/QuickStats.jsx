// /components/analytics/QuickStats.jsx
import { useMemo } from "react";

/**
 * Quick statistics component with gradient cards showing platform performance metrics.
 * Displays monthly active users, lessons completed, total XP, and average session duration.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.platformMetrics - Platform metrics data object
 * @param {number} props.platformMetrics.monthlyActiveUsers - Number of monthly active users
 * @param {number} props.platformMetrics.totalLessonsCompleted - Total lessons completed
 * @param {number} props.platformMetrics.totalXP - Total XP earned across platform
 * @param {number} props.platformMetrics.avgSessionDuration - Average session duration in minutes
 * @returns {JSX.Element|null} Quick stats grid or null if no data provided
 */

export const QuickStats = ({ platformMetrics }) => {
  if (!platformMetrics) return null;

  const stats = useMemo(
    () => [
      {
        value: platformMetrics.monthlyActiveUsers?.toLocaleString() || "0",
        label: "Monthly Active Users",
        change: "↑ from last month",
        gradient: "from-blue-500 to-blue-600",
      },
      {
        value: platformMetrics.totalLessonsCompleted?.toLocaleString() || "0",
        label: "Total Lessons Completed",
        change: "↑ from last month",
        gradient: "from-green-500 to-green-600",
      },
      {
        value: platformMetrics.totalXP?.toLocaleString() || "0",
        label: "Total XP Earned",
        change: "↑ from last month",
        gradient: "from-purple-500 to-purple-600",
      },
      {
        value: `${platformMetrics.avgSessionDuration || 0}m`,
        label: "Average Session",
        change: "↑ from last month",
        gradient: "from-orange-500 to-orange-600",
      },
    ],
    [platformMetrics],
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`bg-gradient-to-r ${stat.gradient} rounded-xl p-6 text-white`}
        >
          <div className="text-2xl font-bold">{stat.value}</div>
          <div className="text-sm opacity-90">{stat.label}</div>
          <div className="text-xs mt-2 opacity-75">{stat.change}</div>
        </div>
      ))}
    </div>
  );
};
