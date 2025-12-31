// SegmentsChart.jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CustomTooltip } from "./CustomTooltip";

export const SegmentsChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%" debounce={50}>
      <BarChart data={data || []}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis
          dataKey="segment"
          stroke="#9CA3AF"
          tick={{ fill: "#9CA3AF", fontSize: 12 }}
        />
        <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          dataKey="count"
          name="Users"
          fill="#3B82F6"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="avgLevel"
          name="Avg Level"
          fill="#10B981"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
