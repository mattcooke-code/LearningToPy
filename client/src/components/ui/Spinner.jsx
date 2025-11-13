// Spinner.jsx
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
    "python-blue": "border-python-blue",
    white: "border-white",
    gray: "border-gray-400",
  };

  const spinner = (
    <div
      className={`animate-spin rounded-full border-b-2 ${colorClasses[color]} ${sizeClasses[size]} ${className}`}
    ></div>
  );

  if (showText) {
    return (
      <div className={`flex items-center ${center ? "justify-center" : ""}`}>
        {spinner}
        <span className="ml-2">{text}</span>
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
