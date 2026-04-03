// AdminStatsCard.jsx
import { Link } from "react-router-dom";

const AdminStatsCard = ({
  title,
  value,
  icon,
  color = "blue",
  trend,
  linkTo,
  onClick,
}) => {
  const colorClasses = {
    blue: "bg-blue-500 dark:bg-blue-600",
    green: "bg-green-500 dark:bg-green-600",
    purple: "bg-purple-500 dark:bg-purple-600",
    red: "bg-red-500 dark:bg-red-600",
    yellow: "bg-yellow-500 dark:bg-yellow-600",
  };

  const Content = (
    <div
      className={`${
        linkTo || onClick ? "cursor-pointer hover:shadow-lg" : ""
      } transition-all duration-200 h-full`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className={`${colorClasses[color]} p-3 rounded-lg`}>
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
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
          {title}
        </h3>
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

  // Important: Ensure the Link or button wrappers also pass down height
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
