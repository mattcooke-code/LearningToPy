// /components/analytics/MetricsGrid.jsx
import { Users, TrendingUp, Target, BookOpen } from "lucide-react";

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
