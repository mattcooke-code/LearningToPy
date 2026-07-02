// AdminStatsCard.jsx
import { Link } from "react-router-dom";

/**
 * Stats card component displaying key metrics with optional trend and navigation.
 * Provides visual representation of administrative statistics with interactive elements.
 *
 * @component
 * @param {Object} props
 * @param {string} props.title - Statistic title displayed below the value
 * @param {string|number} props.value - Main statistic value to display
 * @param {string} props.icon - Icon or emoji to display in the colored badge
 * @param {string} [props.color="blue"] - Color theme for the icon badge (blue, green, purple, red, yellow)
 * @param {Object} [props.trend] - Optional trend indicator with value and positive flag
 * @param {string} props.trend.value - Trend value to display (e.g., "+12%")
 * @param {boolean} props.trend.positive - Whether trend is positive (green) or negative (red)
 * @param {string} [props.linkTo] - Optional URL to navigate to when clicked
 * @param {Function} [props.onClick] - Optional click handler for the card
 * @param {string} [props.headingLevel="h3"] - Semantic heading level (h2, h3, h4, etc.)
 * @returns {JSX.Element} Stats card with icon, value, and optional trend
 */

const COLOR_CLASSES = {
  blue: "bg-blue-500 dark:bg-blue-600",
  green: "bg-green-500 dark:bg-green-600",
  purple: "bg-purple-500 dark:bg-purple-600",
  red: "bg-red-500 dark:bg-red-600",
  yellow: "bg-yellow-500 dark:bg-yellow-600",
};

const AdminStatsCard = ({
  title,
  value,
  icon,
  color = "blue",
  trend,
  linkTo,
  onClick,
  headingLevel: HeadingTag = "h3", // Default to h3, make configurable
}) => {
  const Content = (
    <div
      className={`${
        linkTo || onClick ? "cursor-pointer hover:shadow-lg" : ""
      } transition-all duration-200 h-full`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className={`${COLOR_CLASSES[color]} p-3 rounded-lg`}>
            <span className="text-2xl">{icon}</span>
          </div>
          {trend && (
            <span
              className={`text-sm font-medium px-2 py-1 rounded-full ${
                trend.positive
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
        <HeadingTag className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
          {title}
        </HeadingTag>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {value}
        </p>
        <div className="mt-auto">
          {linkTo && (
            <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
              <span>View details</span>
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="h-full block">
        {Content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left h-full block">
        {Content}
      </button>
    );
  }

  return Content;
};

export default AdminStatsCard;
