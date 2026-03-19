// /components/charts/GrowthChart.jsx
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CustomTooltip } from "./CustomTooltip";

export const GrowthChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%" debounce={50}>
      <AreaChart data={data || []}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis
          dataKey="_id"
          stroke="#9CA3AF"
          tick={{ fill: "#9CA3AF", fontSize: 12 }}
        />
        <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="newUsers"
          name="New Users"
          stroke="#3B82F6"
          fill="#3B82F6"
          fillOpacity={0.3}
        />
        <Area
          type="monotone"
          dataKey="cumulativeUsers"
          name="Total Users"
          stroke="#10B981"
          fill="#10B981"
          fillOpacity={0.3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
