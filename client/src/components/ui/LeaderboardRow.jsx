// /client/components/ui/LeaderboardRow.jsx
/**
 * A leaderboard row component displaying user ranking with visual indicators.
 *
 * This component renders a single row in a leaderboard with special styling for
 * top performers and the current user. It includes medal emojis for podium positions
 * and handles both anonymous and identified users.
 *
 * @component
 * @example
 * ```jsx
 * <LeaderboardRow
 *   rank={1}
 *   user={{ _id: "123", username: "Alice", xp: 1500, isAnonymous: false }}
 *   isCurrent={true}
 * />
 * ```
 *
 * @param {Object} props - Component props
 * @param {number} props.rank - The user's rank position in the leaderboard (1-based)
 * @param {Object} props.user - User object containing user information
 * @param {string} props.user._id - Unique user identifier
 * @param {string} [props.user.username] - User's display name (not present for anonymous users)
 * @param {number} props.user.xp - User's experience points total
 * @param {boolean} props.user.isAnonymous - Whether the user is anonymous
 * @param {boolean} props.isCurrent - Whether this row represents the currently logged-in user
 *
 * @returns {JSX.Element} A styled row with rank indicator, user info, and XP display
 *
 * @visualFeatures
 * - Medal emojis for top 3 positions: 🥇 (1st), 🥈 (2nd), 🥉 (3rd)
 * - Numeric rank display for positions 4+
 * - Special highlighting for current user (blue background/border)
 * - Hover effects for non-current rows
 * - Responsive design with proper spacing
 *
 * @rankDisplayLogic
 * - Positions 1-3: Show medal emojis with special yellow styling
 * - Positions 4+: Show numeric rank with gray styling
 * - Current user: Blue circular background regardless of rank
 * - Anonymous users: Display as "Learner #XXXXXX" (last 6 chars of ID)
 *
 * @stylingDetails
 * - Current user: Blue theme with border emphasis
 * - Top 3 ranks: Yellow theme for medal positions
 * - Other ranks: Gray theme for standard positions
 * - XP display: Python yellow/light color with bold weight
 * - Anonymous indicator: Small gray text label
 *
 * @accessibility
 * - Semantic HTML structure
 * - Clear visual hierarchy
 * - Proper contrast ratios
 * - Hover states for interactive feedback
 */
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
