// FlaggedContentList.jsx
import { useState, useEffect } from "react";
import { adminApiClient, useAuth, useNotification } from "../../context";
import FlagResolutionModal from "../modals/FlagResolutionModal";
import {
  Flag,
  Search,
  Filter,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  User,
  FileText,
  Shield,
  Clock,
  Calendar,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

const FlaggedContentList = ({ limit = null }) => {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "PENDING",
    targetType: "",
    search: "",
  });
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ pending: 0, resolved: 0, escalated: 0 });

  const { showToast } = useNotification();
  const { isAuthenticated } = useAuth();

  const itemsPerPage = limit || 10;

  useEffect(() => {
    if (isAuthenticated) {
      fetchFlags();
      fetchStats();
    }
  }, [filters, page]);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: itemsPerPage,
        status: filters.status,
      });

      if (filters.targetType) {
        params.append("targetType", filters.targetType);
      }

      if (filters.search) {
        params.append("search", filters.search);
      }

      const response = await adminApiClient.get(`/flagged?${params}`);
      const { data: { flaggedContent = [], pagination = {} } = {} } =
        response.data;

      setFlags(flaggedContent);
      setTotalPages(pagination.totalPages || 1);
    } catch (err) {
      showToast("Failed to load flagged content", "error");
      console.error("Flag fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminApiClient.get("/stats/flags");
      setStats(response.data.data || { pending: 0, resolved: 0, escalated: 0 });
    } catch (err) {
      // Silently Fail
    }
  };

  const handleResolveFlag = async (flagId, resolution) => {
    try {
      const response = await adminApiClient.patch(
        `/flagged/${flagId}/resolve`,
        resolution
      );

      showToast("Flag resolved successfully", "success");
      setShowResolutionModal(false);
      setSelectedFlag(null);
      fetchFlags();
      fetchStats();
    } catch (err) {
      showToast("Failed to resolve flag", "error");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: "yellow", icon: Clock, label: "Pending" },
      RESOLVED: { color: "green", icon: CheckCircle, label: "Resolved" },
      WARNING_SENT: {
        color: "blue",
        icon: AlertTriangle,
        label: "Warning Sent",
      },
      ESCALATED: { color: "red", icon: Shield, label: "Escalated" },
      DISMISSED: { color: "gray", icon: XCircle, label: "Dismissed" },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900 dark:text-${config.color}-200`}
      >
        <Icon className="h-3 w-3 mr-1" /> {config.label}
      </span>
    );
  };

  const getTargetTypeIcon = (type) => {
    const icons = {
      COMMENT: MessageSquare,
      EXERCISE_SUBMISSION: FileText,
      USER_PROFILE: User,
      LESSON_CONTENT: FileText,
    };
    return icons[type] || Flag;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getSeverityColor = (reason) => {
    const severeKeywords = [
      "abuse",
      "harassment",
      "spam",
      "cheating",
      "plagiarism",
    ];
    const moderateKeywords = ["inappropriate", "offensive", "misleading"];

    if (
      severeKeywords.some((keyword) => reason.toLowerCase().includes(keyword))
    ) {
      return "red";
    } else if (
      moderateKeywords.some((keyword) => reason.toLowerCase().includes(keyword))
    ) {
      return "orange";
    }
    return "yellow";
  };

  const handleQuickAction = async (flagId, action) => {
    try {
      const resolution = {
        status: action,
        notes: `Quick action: ${action.toLowerCase().replace("_", " ")}`,
      };

      const response = await adminApiClient.patch(
        `/flagged/${flagId}/resolve`,
        resolution
      );
      showToast(
        `Flag marked as ${action.toLowerCase().replace("_", " ")}`,
        "success"
      );
      fetchFlags();
      fetchStats();
    } catch (err) {
      showToast("Failed to update flag", "error");
    }
  };

  /* SPINNER? LOADING STATE?
  if (loading && flags.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }*/

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.pending}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pending Flags
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.resolved}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Resolved
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.escalated}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Escalated
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="font-medium">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="PENDING">Pending</option>
              <option value="RESOLVED">Resolved</option>
              <option value="WARNING_SENT">Warning Sent</option>
              <option value="ESCALATED">Escalated</option>
              <option value="DISMISSED">Dismissed</option>
            </select>

            <select
              value={filters.targetType}
              onChange={(e) =>
                setFilters({ ...filters, targetType: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="">All Types</option>
              <option value="COMMENT">Comments</option>
              <option value="EXERCISE_SUBMISSION">Submissions</option>
              <option value="USER_PROFILE">Profiles</option>
              <option value="LESSON_CONTENT">Content</option>
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                placeholder="Search flags..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Flags List */}
      <div className="space-y-4">
        {flags.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No flags found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filters.status === "PENDING"
                ? "No pending flags to review"
                : `No ${filters.status.toLowerCase().replace("_", " ")} flags`}
            </p>
          </div>
        ) : (
          flags.map((flag) => {
            const TargetIcon = getTargetTypeIcon(flag.targetType);
            const severityColor = getSeverityColor(flag.reason);

            return (
              <div
                key={flag._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div
                          className={`h-10 w-10 rounded-lg bg-${severityColor}-100 dark:bg-${severityColor}-900 flex items-center justify-center`}
                        >
                          <TargetIcon
                            className={`h-5 w-5 text-${severityColor}-600 dark:text-${severityColor}-400`}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {flag.targetType?.replace(/_/g, " ")}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>
                              Reported {formatTimeAgo(flag.createdAt)}
                            </span>
                            <span>•</span>
                            <span>
                              By {flag.reporterId?.username || "Unknown"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Reason
                        </h4>
                        <p className="text-gray-900 dark:text-white">
                          {flag.reason}
                        </p>
                        {flag.description && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {flag.description}
                          </p>
                        )}
                      </div>

                      {/* Target Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {flag.targetUserId && (
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <User className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Target User
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {flag.targetUserId?.username || "Unknown"}
                              </p>
                            </div>
                          </div>
                        )}

                        {flag.resolvedBy && (
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <Shield className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Resolved By
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {flag.resolvedBy?.username} •{" "}
                                {formatTimeAgo(flag.resolvedAt)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Admin Notes */}
                      {flag.adminNotes && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                            Admin Notes
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-400">
                            {flag.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Status and Actions */}
                    <div className="ml-4 flex flex-col items-end space-y-4">
                      {getStatusBadge(flag.status)}

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedFlag(flag);
                            setShowResolutionModal(true);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Review flag"
                        >
                          <Eye className="h-5 w-5" />
                        </button>

                        {flag.status === "PENDING" && (
                          <div className="relative">
                            <button
                              onClick={() =>
                                handleQuickAction(flag._id, "RESOLVED")
                              }
                              className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Mark as resolved"
                            >
                              <ThumbsUp className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions Bar */}
                  {flag.status === "PENDING" && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            handleQuickAction(flag._id, "RESOLVED")
                          }
                          className="px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/40 rounded-lg transition-colors"
                        >
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Mark Resolved
                        </button>
                        <button
                          onClick={() =>
                            handleQuickAction(flag._id, "WARNING_SENT")
                          }
                          className="px-3 py-1.5 text-sm font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/20 hover:bg-yellow-200 dark:hover:bg-yellow-900/40 rounded-lg transition-colors"
                        >
                          <AlertTriangle className="h-4 w-4 inline mr-1" />
                          Send Warning
                        </button>
                        <button
                          onClick={() =>
                            handleQuickAction(flag._id, "ESCALATED")
                          }
                          className="px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                        >
                          <Shield className="h-4 w-4 inline mr-1" />
                          Escalate
                        </button>
                        <button
                          onClick={() =>
                            handleQuickAction(flag._id, "DISMISSED")
                          }
                          className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/20 hover:bg-gray-200 dark:hover:bg-gray-900/40 rounded-lg transition-colors"
                        >
                          <XCircle className="h-4 w-4 inline mr-1" />
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!limit && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-lg shadow">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Page <span className="font-medium">{page}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {showResolutionModal && selectedFlag && (
        <FlagResolutionModal
          flag={selectedFlag}
          onClose={() => {
            setShowResolutionModal(false);
            setSelectedFlag(null);
          }}
          onResolve={handleResolveFlag}
        />
      )}
    </div>
  );
};

export default FlaggedContentList;
