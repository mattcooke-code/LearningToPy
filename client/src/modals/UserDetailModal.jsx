// UserDetailModal.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { adminApiClient, useNotification } from "../context";
import { BaseModal, Spinner } from "../components/ui";
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
  Activity,
  Settings,
  PieChart,
  Check,
  X as XIcon,
} from "lucide-react";

// Utils & Constants
import { normalizeUserData, calculateUserDashboardStats } from "../utils";
import { STAT_COLOR_MAP } from "../constants/uiColors";

const UserDetailModal = ({ isOpen, onClose, user }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { showToast } = useNotification();

  const fetchUserDetails = useCallback(async () => {
    if (!user?._id) return;

    try {
      setLoading(true);

      const [detailsRes, activityRes] = await Promise.allSettled([
        adminApiClient.get(`/users/${user._id}`),
        adminApiClient.get(`/users/${user._id}/activity?limit=20`),
      ]);

      // Handle User Details
      if (detailsRes.status === "fulfilled") {
        setUserDetails(normalizeUserData(detailsRes.value, user));
      } else {
        // Fallback to basic user object if full fetch fails
        setUserDetails(normalizeUserData(null, user));
        showToast("Using cached profile data", "warning");
      }

      // Handle Activity (Optional)
      if (activityRes.status === "fulfilled") {
        const payload = activityRes.value;
        setActivityLogs(
          payload?.userActivity ||
            payload?.activity ||
            (Array.isArray(payload) ? payload : [])
        );
      }
    } catch (error) {
      showToast("Critical error loading user data", "error");
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (isOpen) fetchUserDetails();
  }, [isOpen, fetchUserDetails]);

  const stats = useMemo(
    () => calculateUserDashboardStats(userDetails),
    [userDetails]
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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
      MODULE_COMPLETED: BarChart3,
      XP_EARNED: TrendingUp,
      BADGE_EARNED: Award,
      LOGIN: UserIcon,
    };
    return icons[actionType] || ClockIcon;
  };

  // UI Helper for Tabs
  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 py-3 px-1 text-sm font-bold border-b-2 transition-all ${
        activeTab === id
          ? "border-blue-500 text-blue-600 dark:text-blue-400"
          : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );

  if (loading) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={`Loading ${user.username}...`}
        size="4xl"
      >
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
          <Spinner size="lg" color="python-blue" />
          <p className="text-gray-500 animate-pulse font-medium">
            Syncing learning history...
          </p>
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-2">
          <UserIcon className="h-5 w-5 text-gray-400" />
          <span>User Management Profile</span>
        </div>
      }
      size="5xl"
    >
      {/* Profile Banner */}
      <div className="relative mb-8 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <PieChart className="h-32 w-32 rotate-12" />
        </div>

        <div className="relative flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white text-3xl font-black">
            {user.username?.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                {user.username}
              </h3>
              <div className="flex space-x-2 justify-center md:justify-start">
                {user.isAdmin && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 uppercase">
                    <Shield className="h-3 w-3 mr-1" /> Admin
                  </span>
                )}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    user.isBlocked
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {user.isBlocked ? "Blocked" : "Active Account"}
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-y-2 gap-x-6">
              <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                <Mail className="h-4 w-4 mr-2 text-blue-500" />
                {user.email}
              </div>
              <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-2 text-green-500" />
                Member since {new Date(user.createdAt).getFullYear()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-6 border-b border-gray-100 dark:border-gray-800 mb-8 px-2">
        <TabButton id="overview" label="Overview" icon={Activity} />
        <TabButton id="activity" label="Activity Log" icon={ClockIcon} />
        <TabButton id="stats" label="In-Depth Stats" icon={BarChart3} />
        <TabButton id="settings" label="Preferences" icon={Settings} />
      </div>

      {/* Tab Content Area */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* High Impact Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                const colors = STAT_COLOR_MAP[stat.color] || {
                  bg: "bg-gray-100",
                  text: "text-gray-600",
                };
                return (
                  <div
                    key={stat.label}
                    className="group bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl hover:border-blue-300 transition-all text-center"
                  >
                    <div
                      className={`mx-auto w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className={`h-5 w-5 ${colors.text}`} />
                    </div>
                    <div className="text-xl font-black text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Badge Showcase */}
            <div className="bg-gray-50/50 dark:bg-gray-900/20 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-tighter mb-4 flex items-center">
                <Award className="h-4 w-4 mr-2 text-yellow-500" /> Collection of
                Achievement
              </h4>
              {userDetails.badges?.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {userDetails.badges.map((badge, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-900/50 rounded-lg shadow-sm"
                    >
                      <span className="text-lg">🏆</span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {badge}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  This user hasn't claimed any badges yet.
                </p>
              )}
            </div>
          </div>
        )}
        {activeTab === "activity" && (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {activityLogs.length > 0 ? (
              activityLogs.map((activity, index) => {
                const ActionIcon = getActionIcon(activity.actionType);
                return (
                  <div
                    key={index}
                    className="flex items-center p-4 bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-md transition-all"
                  >
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mr-4">
                      <ActionIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {activity.actionType?.replace(/_/g, " ")}
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium">
                        {activity.contentType || "System Event"} •{" "}
                        {formatDate(activity.completedAt || activity.createdAt)}
                      </p>
                    </div>
                    {activity.xpEarned && (
                      <div className="text-sm font-black text-green-500 ml-4">
                        +{activity.xpEarned} XP
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <Activity className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  No activity history found for this user.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 duration-300">
            {/* Learning Statistics Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-indigo-500" />
                Learning Metrics
              </h4>
              <div className="space-y-4">
                {Object.entries(userDetails.stats || {}).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700/50 pb-2"
                  >
                    <span className="text-xs font-bold text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                    </span>
                    <span className="text-sm font-black text-gray-900 dark:text-white">
                      {value || 0}
                    </span>
                  </div>
                ))}
                {Object.keys(userDetails.stats || {}).length === 0 && (
                  <p className="text-xs text-gray-400 italic py-4 text-center">
                    No granular stats recorded yet.
                  </p>
                )}
              </div>
            </div>

            {/* Account Metadata Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                <Shield className="h-4 w-4 mr-2 text-blue-500" />
                System Metadata
              </h4>
              <div className="space-y-4">
                {[
                  { label: "Internal ID", value: user._id, mono: true },
                  {
                    label: "Last Active",
                    value: userDetails.lastActiveDate
                      ? formatDate(userDetails.lastActiveDate)
                      : "Never",
                  },
                  {
                    label: "Total Time",
                    value: `${Math.floor(
                      (userDetails.totalLearningTime || 0) / 60
                    )} Hours`,
                  },
                  {
                    label: "Status",
                    value: user.isBlocked ? "Restricted" : "Active",
                    color: user.isBlocked ? "text-red-500" : "text-green-500",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700/50 pb-2"
                  >
                    <span className="text-xs font-bold text-gray-500">
                      {item.label}
                    </span>
                    <span
                      className={`text-[11px] font-bold ${
                        item.mono
                          ? "font-mono text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-1 rounded"
                          : item.color || "text-gray-900 dark:text-gray-200"
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-50 dark:border-gray-700">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                  Privacy & Preferences
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Review how this user's profile appears to the community.
                </p>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {Object.entries(userDetails.privacySettings || {}).length >
                0 ? (
                  Object.entries(userDetails.privacySettings || {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center p-6 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors"
                      >
                        <div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                            {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                          </span>
                          <p className="text-xs text-gray-500">
                            Enable visibility for this metric in public
                            leaderboards
                          </p>
                        </div>
                        <div
                          className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                            value
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                          }`}
                        >
                          {value ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <XIcon className="h-3 w-3" />
                          )}
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {value ? "Public" : "Private"}
                          </span>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="p-10 text-center">
                    <Settings className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      No privacy settings configured for this account.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Refreshed: {new Date().toLocaleTimeString()}
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-black rounded-xl text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-gray-200 dark:shadow-none"
          >
            Close Session
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default UserDetailModal;
