// components/admin/SettingInput.jsx
import PropTypes from "prop-types";

const SettingInput = ({
  setting,
  value,
  onChange,
  isChanged = false,
  type = "text",
  options = {},
  label,
  description = "",
}) => {
  const renderInput = () => {
    switch (type) {
      case "color":
        return (
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(setting, e.target.value)}
              className="h-10 w-20 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(setting, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              placeholder="#000000"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        );

      case "select":
        return (
          <select
            value={value}
            onChange={(e) => onChange(setting, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            {options.items?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "toggle":
        return (
          <button
            type="button"
            onClick={() => onChange(setting, !value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(setting, parseFloat(e.target.value) || 0)}
            min={options.min || 0}
            max={options.max}
            step={options.step || 1}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          />
        );

      case "range":
        return (
          <div className="space-y-2">
            <input
              type="range"
              value={value}
              onChange={(e) => onChange(setting, parseFloat(e.target.value))}
              min={options.min || 0}
              max={options.max || 100}
              step={options.step || 1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{options.min || 0}</span>
              <span className="font-medium">{value}</span>
              <span>{options.max || 100}</span>
            </div>
          </div>
        );

      default:
        return (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(setting, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            placeholder={options.placeholder}
          />
        );
    }
  };

  return (
    <div
      className={`space-y-2 ${
        isChanged ? "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {isChanged && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Changed
            </span>
          )}
        </label>
        {type === "toggle" && (
          <span
            className={`text-sm font-medium ${
              value
                ? "text-green-600 dark:text-green-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {value ? "Enabled" : "Disabled"}
          </span>
        )}
      </div>

      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}

      <div className={type === "toggle" ? "" : "mt-1"}>{renderInput()}</div>
    </div>
  );
};

SettingInput.propTypes = {
  setting: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  isChanged: PropTypes.bool,
  type: PropTypes.oneOf([
    "text",
    "number",
    "select",
    "toggle",
    "color",
    "range",
  ]),
  options: PropTypes.shape({
    items: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.any,
        label: PropTypes.string,
      })
    ),
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    placeholder: PropTypes.string,
  }),
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
};

export default SettingInput;
