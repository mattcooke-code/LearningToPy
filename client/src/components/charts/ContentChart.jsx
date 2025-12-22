// ContentChart.jsx
export const ContentChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        layout="vertical"
        data={data || []}
        margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis
          type="number"
          stroke="#9CA3AF"
          tick={{ fill: "#9CA3AF", fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#9CA3AF"
          tick={{ fill: "#9CA3AF", fontSize: 12 }}
          width={120}
        />
        <Tooltip
          content={<CustomTooltip />}
          formatter={(value) => [value.toLocaleString(), ""]}
        />
        <Legend />
        <Bar
          dataKey="views"
          name="Views"
          fill="#8B5CF6"
          radius={[0, 4, 4, 0]}
        />
        <Bar
          dataKey="completions"
          name="Completions"
          fill="#F59E0B"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
