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

/**
 * Area chart component displaying user growth metrics over time.
 * Shows new users and cumulative users with filled area visualization.
 * 
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.data - Array of growth data points
 * @param {string} props.data[]._id - Date identifier for the data point
 * @param {number} props.data[].newUsers - Number of new users on that date
 * @param {number} props.data[].cumulativeUsers - Total cumulative users up to that date
 * @returns {JSX.Element} Growth area chart with responsive design
 */

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
