import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiClient, useAuth } from "../../context";
import { LeaderboardRow, Spinner } from "../ui";

const FullLeaderboardModal = ({
  isOpen,
  onClose,
  userRank,
  surroundingUsers,
}) => {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  //const { leaderboardVersion } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchTopLeaderboard();
    }
  }, [isOpen]);

  const fetchTopLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        "/progress/leaderboard/top?limit=10"
      );
      setTopUsers(response.data.data);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              🏆 Full Leaderboard
            </h2>
            <p className="text-sm text-gray-500">
              See how you rank among all learners
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-6">
          {/* Top 10 Section */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold">Top 10 Learners</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-2">
                {topUsers.map((user, index) => (
                  <LeaderboardRow
                    key={user._id}
                    rank={index + 1}
                    user={user}
                    isCurrent={false}
                  />
                ))}
              </div>
            )}
          </div>

          {/* User's Ranking Section */}
          {userRank && surroundingUsers.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg font-semibold">
                Your Ranking: <span className="text-blue-600">#{userRank}</span>
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
        </div>
      </div>
    </div>
  );
};

export default FullLeaderboardModal;
