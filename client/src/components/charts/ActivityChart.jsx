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
  return (
    <ResponsiveContainer width="100%" height="100%" debounce={50}>
      <LineChart data={data || []}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis
          dataKey="date"
          stroke="#9CA3AF"
          tick={{ fill: "#9CA3AF", fontSize: 12 }}
        />
        <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
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
