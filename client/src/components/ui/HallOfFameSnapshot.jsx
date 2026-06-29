// HallOfFameSnapshot.jsx
import { Trophy, Clock } from "lucide-react";
import Spinner from "./Spinner";

/**
 * Compact snapshot of the Hall of Fame for the Dashboard sidebar.
 * Shows top 3 inductees with a link to the full HoF modal.
 */
const HallOfFameSnapshot = ({ members, totalInducted, loading, onViewAll }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Hall of Fame
        </h2>
        {totalInducted > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {totalInducted} inducted
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="small" />
        </div>
      ) : members.length > 0 ? (
        <div className="space-y-2">
          {members.slice(0, 3).map((member) => (
            <div
              key={member.rank}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <div className="flex items-center space-x-2 min-w-0">
                <div
                  className={`h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold ${
                    member.rank === 1
                      ? "bg-yellow-400 text-yellow-900"
                      : member.rank === 2
                        ? "bg-gray-300 text-gray-700"
                        : member.rank === 3
                          ? "bg-amber-500 text-amber-900"
                          : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {member.rank}
                </div>
                <span
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate"
                  title={member.displayName}
                >
                  {member.displayName}
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                <Clock className="h-3 w-3 mr-1" />
                {formatDate(member.completedAt)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Trophy className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No inductees yet.
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            Complete the course to become the first!
          </p>
        </div>
      )}

      <div className="mt-4 text-center">
        <button
          onClick={onViewAll}
          className="text-python-blue dark:text-python-light hover:underline font-medium text-sm"
        >
          View Full Hall of Fame →
        </button>
      </div>
    </div>
  );
};

export default HallOfFameSnapshot;
