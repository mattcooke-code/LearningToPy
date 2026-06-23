/**
 * @fileoverview
 * Main administrative dashboard providing centralized platform oversight and management capabilities.
 * This page serves as the primary admin interface with real-time statistics, recent user activity,
 * quick action buttons, and flagged content monitoring. Integrates user management, badge awarding,
 * and navigation to other admin sections with comprehensive error handling and loading states.
 */

// /client/src/pages/AdminDashboard.jsx (updated with unwrapped responses)
import { useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNotification } from "../context";
import {
  AdminPage,
  AdminStatsCard,
  FlaggedContentList,
} from "../components/admin";
import { BaseModal, RefreshButton } from "../components/ui";
import { useAdminData } from "../hooks";
import { adminApiClient } from "../services";
import { calculateAdminDashboardStats } from "../utils/statsManagement";
import { BadgeAwardModal } from "../modals";

/**
 * Main administrative dashboard component providing platform oversight and management tools.
 *
 * This component displays comprehensive platform statistics, recent user activity, quick action
 * buttons for common admin tasks, and flagged content monitoring. Features user badge awarding
 * functionality, navigation to detailed admin sections, and real-time data refresh capabilities.
 *
 * @component
 * @returns {JSX.Element} Admin dashboard with stats, users, actions, and flagged content
 *
 * @dataManagement
 * - Fetches dashboard stats and recent users via parallel API calls
 * - Transforms raw stats data using calculateAdminDashboardStats utility
 * - Manages modal states for user selection and badge awarding
 * - Handles loading states with skeleton UI components
 *
 * @userInteractions
 * - Badge awarding with user search and selection modal
 * - Quick navigation to user management, content creation, and reports
 * - Real-time data refresh with loading indicators
 * - Individual user actions (view details, grant badges)
 *
 * @conditionalFeatures
 * - Shows pending flags count badge on "View Reports" button
 * - Displays skeleton loading state during data fetch
 * - Renders user search modal when granting badges
 * - Shows "No users found" message when user list is empty
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedUserForBadge, setSelectedUserForBadge] = useState(null);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const fetchDashboardData = useCallback(async () => {
    const [stats, users] = await Promise.all([
      adminApiClient.get("/stats"),
      adminApiClient.get("/users/search?limit=5"),
    ]);
    return [stats, users];
  }, []);

  const { data, loading, error, refetch } = useAdminData(
    fetchDashboardData,
    [],
    { autoRetry: true, maxRetries: 3 },
  );

  const [statsData, usersData] = data || [{ users: 0 }, { users: [] }];

  const stats = useMemo(
    () => calculateAdminDashboardStats(statsData),
    [statsData],
  );
  const recentUsers = usersData?.users || [];
  const pendingFlagsCount = statsData?.pendingFlags || 0;

  const handleGrantBadge = async () => {
    // Fetch all (or first 50) users
    try {
      const users = await adminApiClient.get("/users/search?limit=50");
      setAllUsers(users.users || []);
      setShowUserSelector(true);
    } catch (err) {
      showToast("Failed to load users", "error");
    }
  };

  const handleViewReports = () => {
    navigate("/admin/flagged");
  };

  const filteredUsers = useMemo(() => {
    if (!userSearchQuery) return allUsers;
    const query = userSearchQuery.toLowerCase();
    return allUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    );
  }, [allUsers, userSearchQuery]);

  if (loading) {
    return (
      <AdminPage
        title="Admin Dashboard"
        description="Monitor and manage your learning platform"
        headerAction={<RefreshButton onClick={refetch} loading={loading} />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Admin Dashboard"
      description="Monitor and manage your learning platform"
      headerAction={<RefreshButton onClick={refetch} loading={loading} />}
    >
      <div className="flex flex-col gap-8 md:gap-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          <AdminStatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon="👥"
            color="blue"
            trend={{ value: "+12%", positive: true }}
            linkTo="/admin/users"
          />
          <AdminStatsCard
            title="Active Users (7d)"
            value={stats.activeUsers}
            icon="🔥"
            color="green"
            trend={{ value: "+8%", positive: true }}
          />
          <AdminStatsCard
            title="Published Lessons"
            value={`${stats.publishedLessons}/${stats.totalLessons}`}
            icon="📚"
            color="purple"
            trend={{
              value: `${stats.publishedPercentage}%`,
              positive: true,
            }}
            linkTo="/admin/content"
          />
          <AdminStatsCard
            title="Pending Flags"
            value={stats.flaggedContent}
            icon="🚩"
            color="red"
            trend={{
              value: pendingFlagsCount > 0 ? `+${pendingFlagsCount}` : "0",
              positive: false,
            }}
            linkTo="/admin/flagged"
          />
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Users
              </h2>
              <Link
                to="/admin/users"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-blue-800 dark:text-blue-200">
                          {user.username?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.username || "Unknown User"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Level {user.level || 1} • {user.xp || 0} XP
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUserForBadge(user);
                          setShowBadgeModal(true);
                        }}
                        className="px-3 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-full transition-colors"
                        title="Grant Badge"
                      >
                        🏆
                      </button>
                      <Link
                        to={`/admin/users/${user._id}`}
                        className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No users found
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/admin/users")}
                className="p-4 bg-blue-300 dark:bg-blue-600/20 hover:bg-blue-400 dark:hover:bg-blue-400/40 rounded-lg dark:text-gray-200 transition-colors text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  👤
                </div>
                <h3 className="font-semibold text-sm">Manage Users</h3>
              </button>

              <button
                onClick={() => navigate("/admin/content?action=create")}
                className="p-4 bg-purple-300 dark:bg-purple-600/20 hover:bg-purple-400 dark:hover:bg-purple-400/40 rounded-lg transition-colors text-center group dark:text-gray-200"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  📝
                </div>
                <h3 className="font-semibold text-sm">Create Content</h3>
              </button>

              <button
                onClick={handleGrantBadge}
                className="p-4 bg-yellow-300/80 dark:bg-yellow-600/60 hover:bg-yellow-300 dark:hover:bg-yellow-400/60 rounded-lg transition-colors text-center group dark:text-gray-200"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  🎁
                </div>
                <h3 className="font-semibold text-sm">Grant Badge</h3>
              </button>

              <button
                onClick={handleViewReports}
                className="p-4 bg-red-300 dark:bg-red-600/20 hover:bg-red-400 dark:hover:bg-red-400/50 rounded-lg transition-colors text-center group relative dark:text-gray-200"
              >
                {pendingFlagsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingFlagsCount}
                  </span>
                )}
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  📊
                </div>
                <h3 className="font-semibold text-sm">View Reports</h3>
              </button>
            </div>
          </div>
        </div>

        {/* Flagged Content */}
        <FlaggedContentList limit={3} />

        {/* User Selector Modal */}
        {showUserSelector && (
          <BaseModal
            isOpen={showUserSelector}
            onClose={() => setShowUserSelector(false)}
            title="Select User to Award Badge"
            size="lg"
          >
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-yellow-500 outline-none"
              />
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredUsers.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => {
                      setSelectedUserForBadge(user);
                      setShowUserSelector(false);
                      setShowBadgeModal(true);
                      setUserSearchQuery("");
                    }}
                    className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      Level {user.level} • {user.xp} XP
                    </div>
                  </button>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {allUsers.length === 0
                      ? "No users found"
                      : "No users match your search"}
                  </div>
                )}
              </div>
            </div>
          </BaseModal>
        )}

        {/* Badge Award Modal */}
        {showBadgeModal && selectedUserForBadge && (
          <BadgeAwardModal
            isOpen={showBadgeModal}
            user={selectedUserForBadge}
            onClose={() => {
              setShowBadgeModal(false);
              setSelectedUserForBadge(null);
            }}
            onSave={() => {
              refetch();
              showToast("Badges updated successfully", "success");
            }}
          />
        )}
      </div>
    </AdminPage>
  );
};

export default AdminDashboard;
