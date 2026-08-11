// components/ui/StatsCard.jsx
import { Zap, Flame, Calendar } from "lucide-react";

const StatsCard = ({ xp = 0, streak = 0, daysActive = 0 }) => {
  const stats = [
    {
      label: "Total XP",
      value: xp.toLocaleString(),
      icon: Zap,
      color: "text-python-blue dark:text-python-yellow",
    },
    {
      label: "Current Streak",
      value: `${streak} day${streak !== 1 ? "s" : ""}`,
      icon: Flame,
      color: "text-green-700 dark:text-green-400",
    },
    {
      label: "Days Active",
      value: daysActive,
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        XP & Activity
      </h3>

      <div className="space-y-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3"
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {stat.label}
                </span>
              </div>
              <span className={`text-lg font-bold ${stat.color}`}>
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsCard;
