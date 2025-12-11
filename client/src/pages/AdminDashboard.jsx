// AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification, adminApiClient } from "../context";
import {
  AdminLayout,
  AdminStatsCard,
  AnalyticsChart,
  FlaggedContentList,
} from "./components/admin";
import { LoadingState } from "../components/ui";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsResponse = await adminApiClient.get("/stats");
      const activityResponse = await adminApiClient.get(
        "/activity-logs?limit=5"
      );

      setStats(statsResponse.data.data);
      setRecentActivity(activityResponse.data.data.logs);
    } catch (err) {
      showNotification("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <LoadingState />
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor and manage your learning platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon="👥"
            change="+12%"
            color="blue"
          />
          <AdminStatsCard
            title="Active Users"
            value={stats.activeUsers}
            icon="🔥"
            change="+8%"
            color="green"
          />
          <AdminStatsCard
            title="Published Lessons"
            value={stats.publishedLessons}
            icon="📚"
            change={`${Math.round(
              (stats.publishedLessons / stats.totalLessons) * 100
            )}%`}
            color="purple"
          />
          <AdminStatsCard
            title="Pending Flags"
            value={stats.flaggedContent}
            icon="🚩"
            change="+3"
            color="red"
            onClick={() => navigate("/admin/flagged")}
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Engagement Overview</h2>
            <AnalyticsChart />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{activity.actionType}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="text-sm px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {activity.targetType}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/admin/users")}
              className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
            >
              <div className="text-2xl mb-2">👥</div>
              <h3 className="font-semibold">User Management</h3>
            </button>
            <button
              onClick={() => navigate("/admin/content")}
              className="p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors"
            >
              <div className="text-2xl mb-2">📚</div>
              <h3 className="font-semibold">Content Editor</h3>
            </button>
            <button
              onClick={() => navigate("/admin/flagged")}
              className="p-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
            >
              <div className="text-2xl mb-2">🚩</div>
              <h3 className="font-semibold">Flagged Content</h3>
            </button>
            <button
              onClick={() => navigate("/admin/settings")}
              className="p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="font-semibold">Settings</h3>
            </button>
          </div>
        </div>

        <FlaggedContentList limit={3} />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
