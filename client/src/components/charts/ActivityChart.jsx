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

/**
 * Line chart component displaying user activity metrics over time.
 * Shows active users, lessons completed, and XP earned with interactive tooltips.
 * 
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.data - Array of activity data points
 * @param {string} props.data[].date - Date identifier for the data point
 * @param {number} props.data[].activeUsers - Number of active users on that date
 * @param {number} props.data[].lessonsCompleted - Number of lessons completed on that date
 * @param {number} props.data[].xpEarned - Amount of XP earned on that date
 * @returns {JSX.Element} Activity line chart with responsive design
 */

export const ActivityChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        No activity data available for this period
      </div>
    );
  }

  // Ensure we have valid data
  const validData = data.filter(
    (item) =>
      item &&
      typeof item === "object" &&
      (item.activeUsers !== undefined || item.lessonsCompleted !== undefined),
  );

  if (validData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Insufficient activity data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320} debounce={50}>
      <LineChart
        data={validData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis
          dataKey="date"
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
        <Legend
          wrapperStyle={{
            fontSize: "12px",
            paddingTop: "10px",
          }}
        />
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
