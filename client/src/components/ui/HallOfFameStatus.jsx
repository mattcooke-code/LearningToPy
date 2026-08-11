// components/ui/HallOfFameStatus.jsx
import { useState } from "react";
import { Trophy, Clock, Star, ChevronRight } from "lucide-react";
import Spinner from "./Spinner";

const HallOfFameStatus = ({ completionData, loading, onOptIn }) => {
  const [optInLoading, setOptInLoading] = useState(false);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-md">
        <Spinner size="small" />
      </div>
    );
  }

  if (!completionData) return null;

  const handleOptIn = async () => {
    setOptInLoading(true);
    try {
      await onOptIn();
    } finally {
      setOptInLoading(false);
    }
  };

  // Already in HoF
  if (completionData.hofJoinedAt) {
    const inductedDate = new Date(completionData.hofJoinedAt);
    return (
      <div className="rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-6 shadow-md border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center space-x-3 mb-3">
          <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Hall of Fame Member
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          You were inducted into the Hall of Fame on{" "}
          <strong>
            {inductedDate.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </strong>
          {completionData.earlyOptIn && " (Early Opt-in)"}.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Your name will forever be remembered among Python Master graduates.
        </p>
      </div>
    );
  }

  // Course completed but not yet in HoF
  if (completionData.courseCompleted) {
    const eligibleDate = new Date(completionData.hofEligibleAt);
    const now = new Date();
    const daysRemaining = Math.max(
      0,
      Math.ceil((eligibleDate - now) / (1000 * 60 * 60 * 24)),
    );

    return (
      <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 shadow-md border border-purple-200 dark:border-purple-800">
        <div className="flex items-center space-x-3 mb-3">
          <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Hall of Fame Eligibility
          </h3>
        </div>

        {daysRemaining > 0 ? (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              You'll be automatically inducted into the Hall of Fame in{" "}
              <strong>
                {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
              </strong>{" "}
              on{" "}
              <strong>
                {eligibleDate.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
              .
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              The 30-day waiting period gives current students a chance to
              compete on the leaderboard before graduates move to the Hall of
              Fame.
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            You are now eligible for Hall of Fame induction! The next cron job
            will process your induction shortly.
          </p>
        )}

        <button
          onClick={handleOptIn}
          disabled={optInLoading}
          className="inline-flex items-center px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {optInLoading ? (
            <Spinner size="small" className="mr-2" />
          ) : (
            <Star className="h-4 w-4 mr-2" />
          )}
          Join Hall of Fame Now
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Skip the wait and join immediately — your choice won't affect your
          rank.
        </p>
      </div>
    );
  }

  return null;
};

export default HallOfFameStatus;
