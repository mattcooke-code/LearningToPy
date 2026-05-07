/**
 * Custom tooltip component for Recharts with formatted data display.
 * Provides styled tooltip with label and color-coded data values.
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.active - Whether tooltip should be displayed
 * @param {Array<Object>} props.payload - Array of data entries to display
 * @param {string} props.payload[].name - Name of the data entry
 * @param {string|number} props.payload[].value - Value of the data entry
 * @param {string} props.payload[].color - Color for the data entry
 * @param {string} props.label - Label to display in tooltip header
 * @returns {JSX.Element|null} Custom tooltip or null when not active
 */

export const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}:{" "}
            {typeof entry.value === "number"
              ? entry.value.toLocaleString()
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};
