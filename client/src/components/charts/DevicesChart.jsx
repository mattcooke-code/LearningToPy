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

/**
 * Pie chart component displaying device usage distribution with percentage labels.
 * Shows device types with color-coded segments and responsive legend layout.
 * 
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.data - Array of device usage data
 * @param {string} props.data[].device - Device type name (e.g., "Desktop", "Mobile")
 * @param {number} props.data[].percentage - Percentage of usage for this device type
 * @returns {JSX.Element} Device usage pie chart with responsive design
 */

export const DevicesChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        No device data available yet
      </div>
    );
  }

  // Ensure we have valid data with percentages
  const validData = data.filter(
    (item) =>
      item &&
      typeof item === "object" &&
      item.device &&
      typeof item.percentage === "number" &&
      item.percentage > 0,
  );

  if (validData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        No valid device data available
      </div>
    );
  }

  // Check if screen is mobile (using window width)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <ResponsiveContainer width="100%" height={320} debounce={50}>
      <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
        <Pie
          data={validData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          dataKey="percentage"
          nameKey="device"
          label={({
            cx,
            cy,
            midAngle,
            innerRadius,
            outerRadius,
            percentage,
          }) => {
            const RADIAN = Math.PI / 180;
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);
            return percentage > 8 ? (
              <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fontWeight={600}
              >
                {`${percentage.toFixed(0)}%`}
              </text>
            ) : null;
          }}
        >
          {validData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS.primary[index % CHART_COLORS.primary.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{
            fontSize: isMobile ? "10px" : "12px",
            paddingTop: "10px",
          }}
          layout={isMobile ? "horizontal" : "vertical"}
          align={isMobile ? "center" : "right"}
          verticalAlign={isMobile ? "bottom" : "middle"}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
