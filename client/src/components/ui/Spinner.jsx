/**
 * A customizable loading spinner component with optional text and multiple styling options.
 *
 * This spinner component provides consistent loading indicators across the application
 * with various sizes, colors, and layout options. It can be used standalone or with
 * accompanying text for better user feedback.
 *
 * @component
 * @example
 * ```jsx
 * // Basic spinner
 * <Spinner />
 *
 * // Large spinner with text
 * <Spinner
 *   size="lg"
 *   color="gray"
 *   showText={true}
 *   text="Processing..."
 *   center={false}
 * />
 * ```
 *
 * @param {Object} props - Component props
 * @param {string} [props.size="md"] - Spinner size preset: "sm" (16px), "md" (48px), or "lg" (64px)
 * @param {string} [props.color="python-blue"] - Color scheme for the spinner: "python-blue", "white", "gray", or "light"
 * @param {string} [props.className=""] - Additional CSS classes to apply to the spinner element
 * @param {boolean} [props.center=true] - If true, centers the spinner using flexbox. If false, spinner uses inline positioning
 * @param {boolean} [props.showText=false] - If true, displays text alongside the spinner
 * @param {string} [props.text="Loading..."] - Text to display when showText is true
 *
 * @returns {JSX.Element} A spinning loader with optional text and centering
 *
 * @sizePresets
 * - "sm" - h-4 w-4 (16px × 16px)
 * - "md" - h-12 w-12 (48px × 48px)
 * - "lg" - h-16 w-16 (64px × 64px)
 *
 * @colorPresets
 * - "python-blue" - Primary brand color with dark mode support
 * - "white" - White/light gray for dark backgrounds
 * - "gray" - Medium gray for neutral contexts
 * - "light" - Light gray for subtle indicators
 *
 * @layoutOptions
 * - When center=true: Wrapped in flex container with justify-center
 * - When center=false: Returns spinner element directly for inline use
 * - When showText=true: Spinner and text are horizontally aligned with spacing
 *
 * @animation
 * Uses CSS animation with animate-spin utility for continuous rotation
 */
const Spinner = ({
  size = "md",
  color = "python-blue",
  className = "",
  center = true,
  showText = false,
  text = "Loading...",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const colorClasses = {
    "python-blue": "border-python-blue dark:border-python-blue",
    white: "border-white dark:border-gray-300",
    gray: "border-gray-400 dark:border-gray-500",
    light: "border-gray-300 dark:border-gray-600",
  };

  const textColorClasses = {
    "python-blue": "text-python-blue dark:text-python-blue",
    white: "text-white dark:text-gray-300",
    gray: "text-gray-600 dark:text-gray-400",
    light: "text-gray-500 dark:text-gray-400",
  };

  const spinner = (
    <div
      role="status"
      className={`animate-spin rounded-full border-2 border-t-transparent ${colorClasses[color]} ${sizeClasses[size]} ${className}`}
    ></div>
  );

  if (showText) {
    return (
      <div className={`flex items-center ${center ? "justify-center" : ""}`}>
        {spinner}
        <span className={`ml-2 text-sm font-medium ${textColorClasses[color]}`}>
          {text}
        </span>
      </div>
    );
  }

  return center ? (
    <div className="flex justify-center items-center">{spinner}</div>
  ) : (
    spinner
  );
};

export default Spinner;
