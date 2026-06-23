import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminApiClient } from "../../services";
import { useAdminData, useAdminMutation } from "../../hooks";
import {
  getStatusConfig,
  getIssueTypeConfig,
} from "../../constants/adminConstants";
import { Pagination, LoadingState } from "../ui";
import {
  FlagResolutionModal,
  LessonPreviewModal,
  UserDetailModal,
} from "../../modals";
import {
  Flag,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  HelpCircle,
} from "lucide-react";

// Debounce utility function
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * List component for displaying and managing flagged content with filtering and quick actions.
 * Provides status-based filtering, search functionality, and administrative resolution tools.
 *
 * @component
 * @param {Object} props
 * @param {number} [props.limit=null] - Optional limit for number of items to display
 * @returns {JSX.Element} Flagged content list with filtering and quick actions
 */

const FlaggedContentList = ({ limit = null }) => {
  // 1. State
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "ALL",
    issueType: "",
    search: "",
  });
  const [searchInput, setSearchInput] = useState(""); // For immediate input
  const debouncedSearch = useDebounce(searchInput, 500); // Debounce with 500ms delay
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [showLessonPreview, setShowLessonPreview] = useState(false);
  const [previewLessonId, setPreviewLessonId] = useState(null);
  const [previewSemanticId, setPreviewSemanticId] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Update filters when debounced search changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch }));
    setPage(1); // Reset to first page when search changes
  }, [debouncedSearch]);

  // 2. Data Fetching (Flags & Stats)
  const queryParams = useMemo(
    () => ({
      page,
      limit: limit || 10,
      status: filters.status,
      issueType: filters.issueType || undefined,
      search: filters.search || undefined,
    }),
    [page, filters, limit],
  );

  const fetchFlags = useCallback(() => {
    return adminApiClient.get("/flagged", { params: queryParams });
  }, [queryParams]);

  const fetchStats = useCallback(() => {
    return adminApiClient.get("/stats/flags");
  }, []);

  const {
    data,
    loading,
    refetch: refreshFlags,
  } = useAdminData(fetchFlags, [fetchFlags]);
  const { data: stats, refetch: refreshStats } = useAdminData(fetchStats, [
    fetchStats,
  ]);

  // 3. Mutations
  const { mutate: resolveFlagMutation, loading: resolving } = useAdminMutation(
    (vars) => adminApiClient.patch(`/flagged/${vars.id}/resolve`, vars.body),
    { successResource: "Flag" },
  );

  const resolveFlag = async (vars) => {
    await resolveFlagMutation(vars);
    refreshFlags();
    refreshStats();
    setShowResolutionModal(false);
    setSelectedFlag(null);
  };

  const flags = data?.flaggedContent || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const currentStats = stats || {
    pending: 0,
    in_review: 0,
    fixed: 0,
    rejected: 0,
    xp_adjusted: 0,
  };

  // 4. Handlers
  const handleQuickAction = (flagId, status) => {
    resolveFlag({
      id: flagId,
      body: {
        status,
        adminResponse:
          status === "FIXED"
            ? "Quick fix applied"
            : "Issue reviewed and resolved",
        xpCompensation: 0,
      },
    });
  };

  const handleViewLesson = (lessonId, semanticId) => {
    setPreviewLessonId(lessonId);
    setPreviewSemanticId(semanticId);
    setShowLessonPreview(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  // Handle search input change without triggering immediate fetch
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  if (loading && flags.length === 0) {
    return <LoadingState message="Fetching reported issues..." height="h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards - Reconfigured for better tablet display */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <StatCard
          label="Pending"
          value={currentStats.pending}
          status="PENDING"
        />
        <StatCard
          label="In Review"
          value={currentStats.in_review || 0}
          status="IN_REVIEW"
        />
        <StatCard
          label="Fixed"
          value={currentStats.fixed || 0}
          status="FIXED"
        />
        <StatCard
          label="Rejected"
          value={currentStats.rejected || 0}
          status="REJECTED"
        />
        <StatCard
          label="XP Adjusted"
          value={currentStats.xp_adjusted || 0}
          status="XP_ADJUSTED"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters((f) => ({ ...f, status: e.target.value }));
              setPage(1);
            }}
            className="rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-sm px-3 py-2 dark:text-gray-300"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="FIXED">Fixed</option>
            <option value="REJECTED">Rejected</option>
            <option value="XP_ADJUSTED">XP Adjusted</option>
          </select>

          <select
            value={filters.issueType}
            onChange={(e) => {
              setFilters((f) => ({ ...f, issueType: e.target.value }));
              setPage(1);
            }}
            className="rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-sm px-3 py-2 dark:text-gray-300"
          >
            <option value="">All Issue Types</option>
            <option value="CONTENT_ERROR">Content Error</option>
            <option value="CODE_ERROR">Code Error</option>
            <option value="QUIZ_ERROR">Quiz Error</option>
            <option value="BROKEN_FUNCTIONALITY">Broken Functionality</option>
            <option value="XP_ADJUSTMENT">XP Adjustment</option>
            <option value="OTHER">Other</option>
          </select>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-300" />
            <input
              type="text"
              placeholder="Search by title or description..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm dark:text-gray-300"
              value={searchInput}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {/* Flag List */}
      <div className="space-y-4">
        {flags.length === 0 ? (
          <EmptyState status={filters.status} />
        ) : (
          flags.map((flag) => (
            <FlagCard
              key={flag._id}
              flag={flag}
              onReview={() => {
                setSelectedFlag(flag);
                setShowResolutionModal(true);
              }}
              onQuickAction={handleQuickAction}
            />
          ))
        )}
      </div>

      {!limit && (
        <Pagination page={page} total={totalPages} onPageChange={setPage} />
      )}

      {showResolutionModal && selectedFlag && (
        <FlagResolutionModal
          flag={selectedFlag}
          onClose={() => setShowResolutionModal(false)}
          onResolve={(id, body) => resolveFlag({ id, body })}
          onViewUser={handleViewUser}
          onViewLesson={handleViewLesson}
        />
      )}

      {showLessonPreview && previewLessonId && (
        <LessonPreviewModal
          isOpen={showLessonPreview}
          onClose={() => {
            setShowLessonPreview(false);
            setPreviewLessonId(null);
            setPreviewSemanticId(null);
          }}
          lessonId={previewLessonId}
          semanticId={previewSemanticId}
          title="Flagged Lesson Preview"
        />
      )}

      {showUserDetail && selectedUser && (
        <UserDetailModal
          isOpen={showUserDetail}
          onClose={() => {
            setShowUserDetail(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}
    </div>
  );
};

// --- Local Sub-Components ---

const StatCard = ({ label, value, status }) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className={`p-2 rounded-lg ${config.badge} mb-2`}>
          <Icon size={20} />
        </div>
        <p className="text-2xl font-bold dark:text-white">{value}</p>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">
          {label}
        </p>
      </div>
    </div>
  );
};

const FlagCard = ({ flag, onReview, onQuickAction }) => {
  const config = getStatusConfig(flag.status);
  const StatusIcon = config.icon;
  const issueConfig = getIssueTypeConfig(flag.issueType);
  const IssueIcon = issueConfig.icon;
  const navigate = useNavigate();

  // Determine which quick actions to show based on current status
  const showQuickActions =
    flag.status === "PENDING" || flag.status === "IN_REVIEW";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-blue-500/50 transition-all">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-3">
          {/* Status and Issue Type Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${config.badge}`}
            >
              <StatusIcon size={10} className="mr-1" /> {config.label}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${config.badge}`}
            >
              <IssueIcon size={10} className="mr-1" /> {issueConfig.label}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              ID: {flag._id.slice(-6)}
            </span>
            {flag.semanticId && (
              <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">
                {flag.semanticId}
              </span>
            )}
          </div>

          {/* Title and Description */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {flag.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {flag.description}
            </p>
            {flag.suggestedFix && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                  Suggested Fix:
                </p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  {flag.suggestedFix}
                </p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-gray-50 dark:border-gray-700/50">
            <div className="text-xs">
              <span className="text-gray-400">Reported by:</span>{" "}
              <button
                onClick={() => navigate(`/admin/users/${flag.reporterId?._id}`)}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                title="View user details"
              >
                {flag.reporterId?.username || "Student"}
              </button>
            </div>
            <div className="text-xs">
              <span className="text-gray-400">Target:</span>{" "}
              <span className="text-gray-700 dark:text-gray-300">
                {flag.targetType}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-gray-400">Reported:</span>{" "}
              <span className="text-gray-700 dark:text-gray-300">
                {new Date(flag.createdAt).toLocaleDateString()}
              </span>
            </div>
            {flag.adminResponse && (
              <div className="text-xs w-full mt-1">
                <span className="text-gray-400">Admin response:</span>{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  {flag.adminResponse}
                </span>
              </div>
            )}
            {flag.xpCompensation > 0 && (
              <div className="text-xs">
                <span className="text-gray-400">XP Awarded:</span>{" "}
                <span className="text-yellow-600 font-medium">
                  +{flag.xpCompensation} XP
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onReview}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Review & Resolve"
          >
            <Eye size={20} />
          </button>
          {showQuickActions && (
            <>
              <button
                onClick={() => onQuickAction(flag._id, "IN_REVIEW")}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Mark as In Review"
              >
                <HelpCircle size={20} />
              </button>
              <button
                onClick={() => onQuickAction(flag._id, "FIXED")}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Mark as Fixed (awards 25 XP)"
              >
                <CheckCircle size={20} />
              </button>
              <button
                onClick={() => onQuickAction(flag._id, "REJECTED")}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Reject"
              >
                <XCircle size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ status }) => {
  const statusText =
    status === "PENDING"
      ? "pending"
      : status === "IN_REVIEW"
        ? "in review"
        : status === "FIXED"
          ? "fixed"
          : "resolved";

  return (
    <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-900/20 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800">
      <Flag className="h-10 w-10 text-gray-300 mb-3" />
      <p className="text-gray-500 dark:text-gray-400">
        No {statusText} issues to show.
      </p>
      <p className="text-xs text-gray-400 mt-1">
        When students report issues, they'll appear here.
      </p>
    </div>
  );
};

export default FlaggedContentList;
