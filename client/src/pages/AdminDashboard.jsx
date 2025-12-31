// AdminDashboard.jsx
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminApiClient } from "../context";
import {
  AdminPage,
  AdminStatsCard,
  FlaggedContentList,
} from "../components/admin";
import { RefreshButton } from "../components/ui";
import { useAdminData } from "../hooks";
import { calculateAdminDashboardStats } from "../utils/statsManagement";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    // Raw responses - let the hook do the work
    return await Promise.all([
      adminApiClient.get("/stats"),
      adminApiClient.get("/users/search?limit=5"),
    ]);
  };

  const { data, loading, error, refetch } = useAdminData(
    fetchDashboardData,
    [],
    { autoRetry: true, maxRetries: 3 }
  );

  const [statsData, usersData] = data || [{}, {}];

  const stats = useMemo(
    () => calculateAdminDashboardStats(statsData),
    [statsData]
  );

  const recentUsers = usersData?.users || [];

  if (loading || error || !data) {
    return (
      <AdminPage
        title="Admin Dashboard"
        description="Monitor and manage your learning platform"
        headerAction={<RefreshButton onClick={refetch} />}
      ></AdminPage>
    );
  }

  return (
    <AdminPage
      title="Admin Dashboard"
      description="Monitor and manage your learning platform"
      headerAction={<RefreshButton onClick={refetch} />}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          trend={{ value: "+3", positive: false }}
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
                  <Link
                    to={`/admin/users/${user._id}`}
                    className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                  >
                    View
                  </Link>
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
              className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors text-center"
            >
              <div className="text-2xl mb-2">👤</div>
              <h3 className="font-semibold text-sm">Manage Users</h3>
            </button>
            <button
              onClick={() => navigate("/admin/content?action=create")}
              className="p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors text-center"
            >
              <div className="text-2xl mb-2">📝</div>
              <h3 className="font-semibold text-sm">Create Content</h3>
            </button>
            <button className="p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors text-center">
              <div className="text-2xl mb-2">🎁</div>
              <h3 className="font-semibold text-sm">Grant Badge</h3>
            </button>
            <button className="p-4 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-lg transition-colors text-center">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-sm">View Reports</h3>
            </button>
          </div>
        </div>
      </div>

      {/* Flagged Content */}
      <FlaggedContentList limit={3} />
    </AdminPage>
  );
};

export default AdminDashboard;
