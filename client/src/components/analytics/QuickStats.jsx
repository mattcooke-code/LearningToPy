// components/analytics/QuickStats.jsx
export const QuickStats = ({ platformMetrics }) => {
  if (!platformMetrics) return null;

  const stats = [
    {
      value: platformMetrics.monthlyActiveUsers?.toLocaleString() || "0",
      label: "Monthly Active Users",
      change: "↑ 15% from last month",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      value: platformMetrics.totalLessonsCompleted?.toLocaleString() || "0",
      label: "Total Lessons Completed",
      change: "↑ 8% from last month",
      gradient: "from-green-500 to-green-600",
    },
    {
      value: `${(platformMetrics.totalXP / 1000000).toFixed(1) || "0"}M`,
      label: "Total XP Earned",
      change: "↑ 12% from last month",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      value: `${platformMetrics.avgSessionDuration || "0"}m`,
      label: "Average Session Duration",
      change: "↑ 2m from last month",
      gradient: "from-orange-500 to-orange-600",
    },
  ];

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
