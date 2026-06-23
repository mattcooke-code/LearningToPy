// components/admin/SettingInput.jsx
import PropTypes from "prop-types";
import { memo, useMemo } from "react";

/**
 * Dynamic form input supporting multiple input types for admin settings.
 * Shows a visual "Changed" indicator when isChanged is true.
 *
 * @component
 * @param {Object} props
 * @param {string} props.setting - Setting key identifier
 * @param {string|number|boolean} props.value - Current value (type depends on input type)
 * @param {Function} props.onChange - Change handler: (setting, value) => void
 * @param {boolean} [props.isChanged=false] - Whether setting has been modified (shows highlight)
 * @param {string} [props.type="text"] - Input type: text, number, select, toggle, color, range
 * @param {Object} [props.options={}] - Type-specific configuration options
 * @param {Array<{value: any, label: string}>} [props.options.items] - For select type
 * @param {number} [props.options.min] - For number and range types
 * @param {number} [props.options.max] - For number and range types
 * @param {number} [props.options.step=1] - For number and range types
 * @param {string} [props.options.placeholder] - For text type
 * @param {string} props.label - Display label for the setting
 * @param {string} [props.description=""] - Helper text below the label
 */

// Extract input components for better organization
const ColorInput = ({ value, onChange, setting }) => (
  <div className="flex items-center space-x-3">
    <input
      type="color"
      value={value || "#000000"}
      onChange={(e) => onChange(setting, e.target.value)}
      className="h-10 w-20 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
      aria-label={`Color picker for ${setting}`}
    />
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(setting, e.target.value)}
      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 "
      placeholder="#000000"
      pattern="^#[0-9A-Fa-f]{6}$"
      aria-label={`Hex color value for ${setting}`}
    />
  </div>
);

const SelectInput = ({ value, onChange, setting, options }) => (
  <select
    value={value || ""}
    onChange={(e) => onChange(setting, e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 "
    aria-label={`Select option for ${setting}`}
  >
    {options.items?.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const ToggleInput = ({ value, onChange, setting }) => (
  <button
    type="button"
    onClick={() => onChange(setting, !value)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
      value ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
    }`}
    role="switch"
    aria-checked={value}
    aria-label={`Toggle ${setting}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        value ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

const NumberInput = ({ value, onChange, setting, options }) => (
  <input
    type="number"
    value={value || 0}
    onChange={(e) => onChange(setting, parseFloat(e.target.value) || 0)}
    min={options.min || 0}
    max={options.max}
    step={options.step || 1}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
    aria-label={`Numeric input for ${setting}`}
  />
);

const RangeInput = ({ value, onChange, setting, options }) => (
  <div className="space-y-2">
    <input
      type="range"
      value={value || 0}
      onChange={(e) => onChange(setting, parseFloat(e.target.value))}
      min={options.min || 0}
      max={options.max || 100}
      step={options.step || 1}
      className="w-full"
      aria-label={`Slider for ${setting}`}
      aria-valuemin={options.min || 0}
      aria-valuemax={options.max || 100}
      aria-valuenow={value || 0}
    />
    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
      <span>{options.min || 0}</span>
      <span className="font-medium">{value || 0}</span>
      <span>{options.max || 100}</span>
    </div>
  </div>
);

const TextInput = ({ value, onChange, setting, type, placeholder }) => (
  <input
    type={type}
    value={value || ""}
    onChange={(e) => onChange(setting, e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
    placeholder={placeholder}
    aria-label={`Text input for ${setting}`}
  />
);

const SettingInput = ({
  setting,
  value = undefined,
  onChange,
  isChanged = false,
  type = "text",
  options = {},
  label,
  description = "",
}) => {
  const safeValue = useMemo(() => {
    if (value !== undefined && value !== null) return value;

    // Type-specific defaults
    switch (type) {
      case "toggle":
        return false;
      case "number":
      case "range":
        return 0;
      case "color":
        return "#000000";
      default:
        return "";
    }
  }, [value, type]);

  const inputComponent = useMemo(() => {
    const handleChange = (newValue) => onChange(setting, newValue);

    switch (type) {
      case "color":
        return (
          <ColorInput value={safeValue} onChange={onChange} setting={setting} />
        );

      case "select":
        return (
          <SelectInput
            value={safeValue}
            onChange={onChange}
            setting={setting}
            options={options}
          />
        );

      case "toggle":
        return (
          <ToggleInput
            value={safeValue}
            onChange={onChange}
            setting={setting}
          />
        );

      case "number":
        return (
          <NumberInput
            value={safeValue}
            onChange={onChange}
            setting={setting}
            options={options}
          />
        );

      case "range":
        return (
          <RangeInput
            value={safeValue}
            onChange={onChange}
            setting={setting}
            options={options}
          />
        );

      default:
        return (
          <TextInput
            value={safeValue}
            onChange={onChange}
            setting={setting}
            type={type}
            placeholder={options.placeholder}
          />
        );
    }
  }, [type, safeValue, onChange, setting, options]);

  return (
    <div
      className={`space-y-2 ${
        isChanged ? "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg" : ""
      }`}
      role="group"
      aria-labelledby={`${setting}-label`}
      aria-describedby={description ? `${setting}-description` : undefined}
    >
      <div className="flex items-center justify-between">
        <label
          id={`${setting}-label`}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
          htmlFor={`${setting}-input`}
        >
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
              safeValue
                ? "text-green-600 dark:text-green-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
            aria-live="polite"
          >
            {safeValue ? "Enabled" : "Disabled"}
          </span>
        )}
      </div>

      {description && (
        <p
          id={`${setting}-description`}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          {description}
        </p>
      )}

      <div className={type === "toggle" ? "" : "mt-1"} id={`${setting}-input`}>
        {inputComponent}
      </div>
    </div>
  );
};

SettingInput.propTypes = {
  setting: PropTypes.string.isRequired,
  value: PropTypes.any,
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
      }),
    ),
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    placeholder: PropTypes.string,
  }),
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
};

export default memo(SettingInput);
