import { useEffect, useState } from "react";
import { apiClient, useAuth, useNotification } from "../../context";
import { getErrorMessage } from "../../utils/getErrorMessage";

// ModuleLeaderboardModal.jsx
const ModuleLeaderboardModal = ({ isOpen, onClose, currentModuleId }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [moduleLeaderboard, setModuleLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentModuleId) {
      const fetchModuleLeaderboard = async () => {
        try {
          setLoading(true);
          const response = await apiClient.get(
            `/progress/leaderboard/module/${currentModuleId}`
          );
          setModuleLeaderboard(response.data.data.users);
          setCurrentUserRank(response.data.data.currentUserRank);
        } catch (err) {
          const errorMessage = getErrorMessage(
            err,
            "Failed to fetch module leaderboard"
          );
          showToast(errorMessage, "error");
          console.error(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      fetchModuleLeaderboard();
    }
  }, [isOpen, showToast, currentModuleId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Module Leaderboard
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            {" "}
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-python-blue"></div>
            <span className="ml-2 text-gray-600">Loading leaderboard...</span>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {moduleLeaderboard.map((user, index) => (
                <div
                  key={user._id}
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    user.isCurrent
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        user.isCurrent
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      #{index + 1}
                    </div>
                    <span
                      className={`font-medium ${
                        user.isCurrent ? "text-blue-700" : "text-gray-700"
                      }`}
                    >
                      {user.isCurrent ? user.username : "You"}
                    </span>
                  </div>
                  <span className="text-python-yellow font-semibold">
                    {user.xp.toLocaleString()} XP
                  </span>
                </div>
              ))}
            </div>

            {currentUserRank && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Your rank in this module: <strong>#{currentUserRank}</strong>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ModuleLeaderboardModal;
