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
