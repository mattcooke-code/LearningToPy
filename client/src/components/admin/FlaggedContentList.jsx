import { useState, useMemo } from "react";
import { adminApiClient } from "../../context";
import { useAdminData, useAdminMutation } from "../../hooks";
import { getStatusConfig } from "../../constants/adminConstants";
import { Pagination, LoadingState } from "../ui";
import FlagResolutionModal from "../../modals/FlagResolutionModal";
import {
  Flag,
  Search,
  Eye,
  ThumbsUp,
  MessageSquare,
  FileText,
  User,
} from "lucide-react";

const FlaggedContentList = ({ limit = null }) => {
  // 1. State
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "PENDING",
    targetType: "",
    search: "",
  });
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [showResolutionModal, setShowResolutionModal] = useState(false);

  // 2. Data Fetching (Flags & Stats)
  const queryParams = useMemo(
    () => ({
      page,
      limit: limit || 10,
      status: filters.status,
      targetType: filters.targetType || undefined,
      search: filters.search || undefined,
    }),
    [page, filters, limit]
  );

  const {
    data,
    loading,
    refetch: refreshFlags,
  } = useAdminData(
    () => adminApiClient.get("/flagged", { params: queryParams }),
    [queryParams]
  );

  const { data: stats, refetch: refreshStats } = useAdminData(
    () => adminApiClient.get("/stats/flags"),
    []
  );

  // 3. Mutations
  const { mutate: resolveFlag } = useAdminMutation(
    (vars) => adminApiClient.patch(`/flagged/${vars.id}/resolve`, vars.body),
    {
      successResource: "Flag",
      onSuccess: () => {
        refreshFlags();
        refreshStats();
        setShowResolutionModal(false);
        setSelectedFlag(null);
      },
    }
  );

  const flags = data?.flaggedContent || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const currentStats = stats || { pending: 0, resolved: 0, escalated: 0 };

  // 4. Handlers
  const handleQuickAction = (flagId, action) => {
    resolveFlag({
      id: flagId,
      body: {
        status: action,
        notes: `Quick action: ${action.toLowerCase().replace("_", " ")}`,
      },
    });
  };

  if (loading && flags.length === 0) {
    return <LoadingState message="Fetching flagged items..." height="h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Pending"
          value={currentStats.pending}
          status="PENDING"
        />
        <StatCard
          label="Resolved"
          value={currentStats.resolved}
          status="RESOLVED"
        />
        <StatCard
          label="Escalated"
          value={currentStats.escalated}
          status="ESCALATED"
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
            className="rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-sm"
          >
            {[
              "PENDING",
              "RESOLVED",
              "WARNING_SENT",
              "ESCALATED",
              "DISMISSED",
            ].map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reason or user..."
              className="w-full pl-10 rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-sm"
              value={filters.search}
              onChange={(e) => {
                setFilters((f) => ({ ...f, search: e.target.value }));
                setPage(1);
              }}
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
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`p-3 rounded-lg bg-${config.color}-100 dark:bg-${config.color}-900/30 text-${config.color}-600`}
        >
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

const FlagCard = ({ flag, onReview, onQuickAction }) => {
  const config = getStatusConfig(flag.status);
  const StatusIcon = config.icon;

  const targetIcons = {
    COMMENT: MessageSquare,
    EXERCISE_SUBMISSION: FileText,
    USER_PROFILE: User,
  };
  const TargetIcon = targetIcons[flag.targetType] || Flag;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-python-blue/50 transition-all">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-${config.color}-100 text-${config.color}-700`}
            >
              <StatusIcon size={10} className="mr-1" /> {config.label}
            </span>
            <span className="text-xs text-gray-400">
              ID: {flag._id.slice(-6)}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
              <TargetIcon size={16} className="text-gray-400" />
              <span>{flag.targetType?.replace(/_/g, " ")}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {flag.reason}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-gray-50 dark:border-gray-700/50">
            <div className="text-xs">
              <span className="text-gray-400">Reporter:</span>{" "}
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {flag.reporterId?.username || "System"}
              </span>
            </div>
            {flag.targetUserId && (
              <div className="text-xs">
                <span className="text-gray-400">Target User:</span>{" "}
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {flag.targetUserId?.username}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onReview}
            className="p-2 text-gray-400 hover:text-python-blue hover:bg-python-blue/5 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={20} />
          </button>
          {flag.status === "PENDING" && (
            <button
              onClick={() => onQuickAction(flag._id, "RESOLVED")}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Resolve Immediately"
            >
              <ThumbsUp size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ status }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-900/20 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800">
    <Flag className="h-10 w-10 text-gray-300 mb-3" />
    <p className="text-gray-500 dark:text-gray-400">
      No {status.toLowerCase()} flags to show.
    </p>
  </div>
);

export default FlaggedContentList;
