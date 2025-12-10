// /client/components/ui/LeaderboardRow.jsx
const LeaderboardRow = ({ rank, user, isCurrent }) => {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg transition ${
        isCurrent
          ? "bg-blue-50 border border-blue-200"
          : "bg-gray-50 hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            isCurrent
              ? "bg-blue-500 text-white"
              : rank <= 3
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
        </div>
        <div>
          <span
            className={`font-medium ${
              isCurrent ? "text-blue-700" : "text-gray-700"
            }`}
          >
            {user.isAnonymous
              ? `Learner #${user._id.slice(-6)}`
              : user.username}
          </span>
          {user.isAnonymous && (
            <span className="ml-2 text-xs text-gray-500">(Anonymous)</span>
          )}
        </div>
      </div>
      <span className="text-python-yellow font-semibold">
        {user.xp.toLocaleString()} XP
      </span>
    </div>
  );
};

export default LeaderboardRow;
