// LeaderboardModal.jsx
import { useEffect, useState } from "react";
import { useNotification } from "../context";
import { apiClient } from "../services";
import { getErrorMessage } from "../utils";
import { BaseModal, LeaderboardRow, Spinner } from "../components/ui";

/**
 * Gamification modal displaying competitive leaderboards for global and module rankings.
 *
 * @component
 * @param {Object}   props
 * @param {boolean}  props.isOpen                  - Whether the modal is open
 * @param {Function} props.onClose                 - Function to close the modal
 * @param {string}   [props.type="global"]         - "global" or "module"
 * @param {string}   [props.moduleId=null]         - Module ID for module leaderboards
 * @param {number}   [props.userRank=null]         - User's current rank (global only)
 * @param {Array}    [props.surroundingUsers=[]]   - Users surrounding current user (global only)
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

  // Derived — always computed fresh so it stays in sync with topUsers,
  // even when surroundingUsers is reset from props.
  const visibleSurroundingUsers = surroundingUsers.filter(
    (u) => !topUsers.some((t) => t._id === u._id),
  );

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
          // Fix: was stored as `response` but read as `data`
          const data = await apiClient.get(
            "/progress/leaderboard/top?limit=10",
          );
          setTopUsers(
            Array.isArray(data)
              ? data
              : data.topUsersWithPrivacy || data.users || [],
          );
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

          {/* Your Neighbourhood (Global Only) */}
          {/* visibleSurroundingUsers filters out anyone already shown in topUsers,
              preventing duplicate _id keys across the two lists. */}
          {!isModule && visibleSurroundingUsers.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold border-t pt-4 dark:border-gray-700 dark:text-gray-300">
                Your Ranking:{" "}
                <span className="text-python-blue dark:text-python-yellow">
                  #{currentUserRank || "—"}
                </span>
              </h3>
              <div className="space-y-2">
                {visibleSurroundingUsers.map((user) => (
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

          {/* Module: Your Rank Footer */}
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
