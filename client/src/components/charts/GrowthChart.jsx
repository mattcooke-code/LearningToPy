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
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        No growth data available for this period
      </div>
    );
  }

  // Ensure we have valid data
  const validData = data.filter(
    (item) =>
      item &&
      typeof item === "object" &&
      (item.newUsers !== undefined || item.cumulativeUsers !== undefined),
  );

  if (validData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Insufficient growth data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320} debounce={50}>
      <AreaChart
        data={validData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis
          dataKey="_id"
          stroke="#9CA3AF"
          tick={{ fill: "#9CA3AF", fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="#9CA3AF"
          tick={{ fill: "#9CA3AF", fontSize: 12 }}
          width={40}
          allowDecimals={false}
        />
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
