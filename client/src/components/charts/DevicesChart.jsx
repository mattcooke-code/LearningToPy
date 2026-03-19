// DevicesChart.jsx
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CustomTooltip } from "./CustomTooltip";
import { CHART_COLORS } from "../../constants/adminConstants";

export const DevicesChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        No device data available yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" debounce={50}>
      <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <Pie
          data={data || []}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={80}
          dataKey="percentage"
          nameKey="device"
          label={({ device, percentage }) =>
            `${device}: ${percentage.toFixed(1)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS.primary[index % CHART_COLORS.primary.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
