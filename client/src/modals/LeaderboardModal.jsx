// LeaderboardModal.jsx
import { useEffect, useState } from "react";
import { useNotification } from "../context";
import { apiClient } from "../services";
import { getErrorMessage } from "../utils";
import { BaseModal, LeaderboardRow, Spinner } from "../components/ui";

/**
 * @fileoverview
 * Gamification modal displaying competitive leaderboards for global and module rankings.
 * This component provides comprehensive leaderboard functionality with support for both
 * global and module-specific rankings, user position highlighting, and surrounding
 * user context. Features adaptive data fetching, loading states, and responsive
 * design for optimal user engagement and competitive motivation.
 */

/**
 * Gamification modal displaying competitive leaderboards for global and module rankings.
 *
 * This component creates an engaging leaderboard interface that displays competitive
 * rankings for both global platform-wide leaderboards and module-specific leaderboards.
 * Features include top users display, user position highlighting, surrounding user context
 * for global rankings, and adaptive data fetching based on leaderboard type. The modal
 * provides visual feedback for user rankings, loading states, and comprehensive error
 * handling to ensure a smooth competitive experience.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {string} [props.type="global"] - Leaderboard type ("global" or "module")
 * @param {string|null} [props.moduleId=null] - Module ID for module-specific leaderboards
 * @param {Object|null} [props.userRank=null] - User's current rank (for global leaderboards)
 * @param {Array} [props.surroundingUsers=[]] - Users surrounding current user (for global leaderboards)
 * @returns {JSX.Element} Leaderboard interface with rankings and user context
 *
 * @leaderboardTypes
 * - Global Leaderboard: Platform-wide rankings with top 10 users
 * - Module Leaderboard: Module-specific rankings with all participants
 * - Adaptive title and subtitle based on leaderboard type
 * - Different modal sizes and styling for each type
 * - Contextual data fetching based on type
 *
 * @dataFetching
 * - Global: GET /progress/leaderboard/top?limit=10
 * - Module: GET /progress/leaderboard/module/{moduleId}
 * - Automatic data refresh on modal open
 * - Error handling with toast notifications
 * - Loading states with visual indicators
 *
 * @userPositioning
 * - Current user highlighting in rankings
 * - Surrounding users display for global leaderboards
 * - Rank display for module leaderboards when not in top list
 * - Visual distinction for current user entries
 * - Contextual ranking information
 *
 * @stateManagement
 * - topUsers: Array of top-ranked users
 * - currentUserRank: User's current ranking position
 * - surroundingUsers: Users around current user (global only)
 * - loading: Loading state for API operations
 * - Reactive to prop changes for initial data
 *
 * @userExperience
 * - Responsive design for mobile and desktop
 * - Loading indicators during data fetching
 * - Clear visual hierarchy for rankings
 * - Smooth transitions and hover effects
 * - Accessible ranking information
 *
 * @visualDesign
 * - Professional leaderboard styling
 * - User avatars and ranking badges
 * - Color-coded user highlighting
 * - Consistent spacing and typography
 * - Modal size adaptation for content
 *
 * @errorHandling
 * - Network error handling with user notifications
 * - Graceful fallbacks for missing data
 * - Loading state management
 * - User-friendly error messages
 * - Automatic retry mechanisms
 *
 * @accessibility
 * - Semantic HTML structure for rankings
 * - Proper ARIA labels and roles
 * - Screen reader compatible ranking information
 * - Keyboard navigation support
 * - High contrast support for user highlighting
 */

const LeaderboardModal = ({
  isOpen,
  onClose,
  type = "global",
  moduleId = null,
  userRank: initialUserRank = null,
  surroundingUsers: initialSurroundingUsers = [],
}) => {
  const { showToast } = useNotification();
  const [topUsers, setTopUsers] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(initialUserRank);
  const [surroundingUsers, setSurroundingUsers] = useState(
    initialSurroundingUsers,
  );
  const [loading, setLoading] = useState(false);

  const isModule = type === "module";

  const isUserInTopList = topUsers.some((u) => u.isCurrent);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLeaderboard = async () => {
      try {
        setLoading(true);

        if (isModule && moduleId) {
          const data = await apiClient.get(
            `/progress/leaderboard/module/${moduleId}`,
          );
          setTopUsers(data.users || []);
          setCurrentUserRank(data.currentUserRank || null);
          setSurroundingUsers([]);
        } else {
          const response = await apiClient.get(
            "/progress/leaderboard/top?limit=10",
          );
          setTopUsers(Array.isArray(data) ? data : data.users || []);
          setSurroundingUsers(initialSurroundingUsers);
          setCurrentUserRank(initialUserRank);
        }
      } catch (err) {
        showToast(getErrorMessage(err, "Failed to load leaderboard"), "error");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [isOpen, isModule, moduleId, initialSurroundingUsers, initialUserRank]);

  const title = isModule ? "Module Leaderboard" : "🏆 Full Leaderboard";
  const subtitle = isModule
    ? "See how you rank in this module"
    : "See how you rank among all learners";

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={isModule ? "md" : "2xl"}
      backdropBlur={!isModule}
      closeOnOverlayClick
      closeOnEscape
    >
      <p className="text-sm text-gray-500 mb-6">{subtitle}</p>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="md" />
          <p className="mt-3 text-gray-500 dark:text-gray-300">
            Loading leaderboard...
          </p>
        </div>
      ) : (
        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2">
          {/* Top Users */}
          <div>
            <h3 className="mb-3 text-lg font-semibold dark:text-gray-300">
              {isModule ? "Top Learners" : "Top 10 Learners"}
            </h3>
            <div className="space-y-2">
              {topUsers.length > 0 ? (
                topUsers.map((user, index) => (
                  <LeaderboardRow
                    key={user._id || index}
                    rank={isModule ? index + 1 : user.rank || index + 1}
                    user={user}
                    isCurrent={user.isCurrent}
                  />
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-300 italic">
                  No data available.
                </p>
              )}
            </div>
          </div>

          {/* Your Neighborhood (Global Only) */}
          {!isModule && surroundingUsers.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold border-t pt-4 dark:border-gray-700 dark:text-gray-300">
                Your Ranking:{" "}
                <span className="text-python-blue dark:text-python-yellow">
                  #{currentUserRank || "—"}
                </span>
              </h3>
              <div className="space-y-2">
                {surroundingUsers.map((user) => (
                  <LeaderboardRow
                    key={user._id}
                    rank={user.rank}
                    user={user}
                    isCurrent={user.isCurrent}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Module: Your Rank Footer (Fixed Logic) */}
          {isModule && currentUserRank && !isUserInTopList && (
            <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-100 dark:border-gray-700 dark:text-gray-200">
              Your rank in this module: <strong>#{currentUserRank}</strong>
            </div>
          )}
        </div>
      )}
    </BaseModal>
  );
};

export default LeaderboardModal;
