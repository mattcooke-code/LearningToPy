// ActivityChart.jsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CustomTooltip } from "./CustomTooltip";

export const ActivityChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        No activity data available for this period
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" debounce={50}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis
          dataKey="date"
          stroke="#9CA3AF"
          tick={{ fill: "#9CA3AF", fontSize: 12 }}
        />
        <YAxis
          stroke="#9CA3AF"
          tick={{ fill: "#9CA3AF", fontSize: 12 }}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="activeUsers"
          name="Active Users"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="lessonsCompleted"
          name="Lessons Completed"
          stroke="#10B981"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="xpEarned"
          name="XP Earned"
          stroke="#8B5CF6"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6, stroke: "#8B5CF6", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
