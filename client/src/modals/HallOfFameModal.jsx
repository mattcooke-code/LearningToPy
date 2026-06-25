// HallOfFameModal.jsx
import { useState } from "react";
import { useNotification } from "../context";
import { useHallOfFame } from "../hooks";
import { BaseModal, Spinner } from "../components/ui";
import { Trophy, Clock, Zap } from "lucide-react";

/**
 * Modal displaying the Hall of Fame — all inducted course completers,
 * ranked by completion date (earliest = #1).
 *
 * Supports pagination for browsing beyond the initial 20.
 */
const HallOfFameModal = ({ isOpen, onClose }) => {
  const { showToast } = useNotification();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { members, totalInducted, loading, error } = useHallOfFame(
    isOpen,
    limit,
    page,
  );

  const totalPages = Math.ceil(totalInducted / limit);

  if (error) {
    showToast(error, "error");
  }

  const formatTimeToComplete = (days) => {
    if (!days && days !== 0) return "—";
    if (days < 1) return "< 1 day";
    if (days === 1) return "1 day";
    if (days < 30) return `${days} days`;
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? "s" : ""}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="🏛️ Hall of Fame"
      size="3xl"
      backdropBlur
      closeOnOverlayClick
      closeOnEscape
    >
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        The pioneers who completed the entire curriculum. Ranked by completion
        date — the earliest finishers sit at the top. Total inducted:{" "}
        <strong>{totalInducted}</strong>
      </p>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="md" />
          <p className="mt-3 text-gray-500 dark:text-gray-300">
            Loading Hall of Fame...
          </p>
        </div>
      ) : members.length > 0 ? (
        <>
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Learner</div>
            <div className="col-span-3">Completed</div>
            <div className="col-span-2">Time to Finish</div>
            <div className="col-span-2">Status</div>
          </div>

          {/* Table Body */}
          <div className="max-h-[55vh] overflow-y-auto pr-2 space-y-1">
            {members.map((member) => (
              <div
                key={member.rank}
                className={`grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center px-4 py-3 rounded-lg transition ${
                  member.rank <= 3
                    ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                    : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                }`}
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center">
                  {member.rank === 1 ? (
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  ) : member.rank === 2 ? (
                    <Trophy className="h-5 w-5 text-gray-400" />
                  ) : member.rank === 3 ? (
                    <Trophy className="h-5 w-5 text-amber-600" />
                  ) : (
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 w-5 text-center">
                      {member.rank}
                    </span>
                  )}
                </div>

                {/* Learner */}
                <div className="col-span-4">
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {member.displayName}
                  </span>
                  {member.isAnonymous && (
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      (Anonymous)
                    </span>
                  )}
                </div>

                {/* Completed Date */}
                <div className="col-span-3 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-3.5 w-3.5 inline mr-1" />
                  {formatDate(member.completedAt)}
                </div>

                {/* Time to Complete */}
                <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">
                  {formatTimeToComplete(member.timeToCompleteDays)}
                </div>

                {/* Status */}
                <div className="col-span-2">
                  {member.earlyOptIn ? (
                    <span className="inline-flex items-center text-xs font-medium text-green-700 dark:text-green-400">
                      <Zap className="h-3 w-3 mr-1" />
                      Early Opt-In
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Standard
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No inductees yet. Be the first!
          </p>
        </div>
      )}
    </BaseModal>
  );
};

export default HallOfFameModal;
