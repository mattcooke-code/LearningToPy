// /client/components/ui/LeaderboardRow.jsx
const LeaderboardRow = ({ rank, user, isCurrent }) => {
  const getRankDisplay = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg transition ${
        isCurrent
          ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
          : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            isCurrent
              ? "bg-blue-500 dark:bg-blue-600 text-white"
              : rank <= 3
                ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          {getRankDisplay(rank)}
        </div>
        <div>
          <span
            className={`font-medium ${
              isCurrent
                ? "text-blue-700 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-200"
            }`}
          >
            {user.isAnonymous
              ? `Learner #${user._id.slice(-6)}`
              : user.username}
          </span>
          {user.isAnonymous && (
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              (Anonymous)
            </span>
          )}
        </div>
      </div>
      <span className="text-python-yellow dark:text-python-light font-bold">
        {user.xp.toLocaleString()} XP
      </span>
    </div>
  );
};

export default LeaderboardRow;
