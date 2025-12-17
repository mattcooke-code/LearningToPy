import { useState, useEffect } from "react";
import { adminApiClient, useNotification } from "../../context";
import { Spinner } from "../ui";
import BaseModal from "./BaseModal";
import {
  Calendar,
  Trophy,
  Target,
  BarChart3,
  Award,
  BookOpen,
  Zap,
  Shield,
  Mail,
  User as UserIcon,
  TrendingUp,
  Clock as ClockIcon,
} from "lucide-react";

const UserDetailModal = ({ user, onClose }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { showToast } = useNotification();

  useEffect(() => {
    fetchUserDetails();
  }, [user._id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);

      let userData = null;
      let activityData = [];

      try {
        const detailsRes = await adminApiClient.get(`/users/${user._id}`);
        userData = detailsRes.data;

        if (userData.success && userData.id) {
          userData = {
            _id: userData.id || userData._id,
            username: userData.username,
            email: userData.email,
            level: userData.level || userData.currentLevel,
            xp: userData.xp || userData.totalXP,
            streak: userData.streak,
            badges: userData.badges || [],
            completedLessons: userData.completedLessons || [],
            completedModules: userData.completedModules || [],
            stats: userData.stats || {},
            privacySettings: userData.privacySettings || {},
            lastActiveDate: userData.lastActiveDate || userData.lastActive,
            totalLearningTime:
              userData.totalLearningTime || userData.totalSessionTime,
            createdAt: userData.createdAt,
            isAdmin: userData.isAdmin,
            isBlocked: userData.isBlocked,
          };
        }
      } catch (detailsError) {
        userData = {
          ...user,
          badges: [],
          completedLessons: [],
          completedModules: [],
          stats: {},
          xp: user.xp || 0,
          level: user.level || 1,
          streak: user.streak || 0,
        };
      }

      try {
        const activityRes = await adminApiClient.get(
          `/users/${user._id}/activity?limit=20`
        );
        const responseData =
          activityRes.data || activityRes.data?.data || activityRes;
        activityData =
          responseData?.userActivity || responseData?.activity || [];
      } catch (activityError) {
        // Activity data is optional
      }

      setUserDetails(userData);
      setActivityLogs(activityData);
    } catch (error) {
      showToast("Failed to load user details", "error");
    } finally {
      setLoading(false);
    }
  };

  // Color mapping for stats - fixes dynamic class issue
  const colorClassMap = {
    yellow: {
      bg: "bg-yellow-100 dark:bg-yellow-900",
      text: "text-yellow-600 dark:text-yellow-400",
    },
    green: {
      bg: "bg-green-100 dark:bg-green-900",
      text: "text-green-600 dark:text-green-400",
    },
    orange: {
      bg: "bg-orange-100 dark:bg-orange-900",
      text: "text-orange-600 dark:text-orange-400",
    },
    purple: {
      bg: "bg-purple-100 dark:bg-purple-900",
      text: "text-purple-600 dark:text-purple-400",
    },
    blue: {
      bg: "bg-blue-100 dark:bg-blue-900",
      text: "text-blue-600 dark:text-blue-400",
    },
    indigo: {
      bg: "bg-indigo-100 dark:bg-indigo-900",
      text: "text-indigo-600 dark:text-indigo-400",
    },
  };

  const stats = [
    {
      icon: Trophy,
      label: "Total XP",
      value: userDetails?.xp?.toLocaleString() || "0",
      color: "yellow",
    },
    {
      icon: Target,
      label: "Level",
      value: userDetails?.level || 1,
      color: "green",
    },
    {
      icon: Zap,
      label: "Streak",
      value: userDetails?.streak || 0,
      color: "orange",
    },
    {
      icon: Award,
      label: "Badges",
      value: userDetails?.badges?.length || 0,
      color: "purple",
    },
    {
      icon: BookOpen,
      label: "Lessons",
      value: userDetails?.completedLessons?.length || 0,
      color: "blue",
    },
    {
      icon: BarChart3,
      label: "Modules",
      value: userDetails?.completedModules?.length || 0,
      color: "indigo",
    },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionIcon = (actionType) => {
    const icons = {
      LESSON_COMPLETED: BookOpen,
      MODULE_COMPLETED: BookOpen,
      XP_EARNED: TrendingUp,
      BADGE_EARNED: Award,
      LOGIN: UserIcon,
    };
    return icons[actionType] || ClockIcon;
  };

  if (loading) {
    return (
      <BaseModal
        isOpen={true}
        onClose={onClose}
        title={`Loading ${user.username}...`}
        size="4xl"
        showCloseButton={false}
      >
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" color="python-blue" center={true} />
        </div>
      </BaseModal>
    );
  }

  if (!userDetails || !userDetails.username) {
    return (
      <BaseModal isOpen={true} onClose={onClose} title="User Details" size="md">
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Shield className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Unable to load user details
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The user data could not be retrieved.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title={`User Details: ${user.username}`}
      size="4xl"
      className="max-h-[90vh] flex flex-col"
    >
      {/* User Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {user.username?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user.username}
            </h3>
            {user.isAdmin && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-4">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Mail className="h-4 w-4 mr-1" />
              {user.email}
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4 mr-1" />
              Joined {formatDate(user.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          {["overview", "activity", "stats", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                const colorClasses = colorClassMap[stat.color];

                return (
                  <div
                    key={stat.label}
                    className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center"
                  >
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colorClasses.bg} mb-3`}
                    >
                      <Icon className={`h-6 w-6 ${colorClasses.text}`} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Badges */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Badges Earned
              </h4>
              {userDetails.badges?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {userDetails.badges.map((badge, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-800/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center"
                    >
                      <div className="text-2xl mb-2">🏆</div>
                      <div className="font-medium text-yellow-800 dark:text-yellow-300 text-sm">
                        {badge}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  No badges earned yet
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h4>
            {activityLogs.length > 0 ? (
              <div className="space-y-3">
                {activityLogs.map((activity, index) => {
                  const ActionIcon = getActionIcon(activity.actionType);
                  return (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <ActionIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {activity.actionType?.replace(/_/g, " ")}
                          </h5>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(
                              activity.completedAt || activity.createdAt
                            )}
                          </span>
                        </div>
                        {activity.contentType && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Type: {activity.contentType}
                          </p>
                        )}
                        {activity.elapsedSeconds && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Time: {activity.elapsedSeconds}s
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">
                No recent activity
              </p>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Learning Stats */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Learning Statistics
                </h4>
                <div className="space-y-3">
                  {Object.entries(userDetails.stats || {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-600 dark:text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {value || 0}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Account Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      User ID
                    </span>
                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                      {user._id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Last Active
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(userDetails.lastActiveDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Learning Time
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {Math.floor((userDetails.totalLearningTime || 0) / 60)}{" "}
                      hours
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Account Status
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.isBlocked
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      }`}
                    >
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Privacy Settings
              </h4>
              <div className="space-y-4">
                {Object.entries(userDetails.privacySettings || {}).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <span className="text-gray-900 dark:text-white capitalize">
                          {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                        </span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Controls whether{" "}
                          {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${
                          value
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {value ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default UserDetailModal;
