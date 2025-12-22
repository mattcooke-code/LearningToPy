// DevicesChart.jsx
import { CHART_COLORS } from "../../../constants/adminConstants";

export const DevicesChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data || []}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={80}
          fill="#8884d8"
          dataKey="percentage"
          nameKey="device"
          label={({ name, percentage }) => `${name}: ${percentage}%`}
        >
          {(data || []).map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS.primary[index % CHART_COLORS.primary.length]}
            />
          ))}
        </Pie>
        <Tooltip
          content={<CustomTooltip />}
          formatter={(value) => [`${value}%`, "Percentage"]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
