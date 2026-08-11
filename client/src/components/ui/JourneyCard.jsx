// components/ui/JourneyCard.jsx
import { Trophy, Clock, Star, Target, ChevronRight } from "lucide-react";
import Spinner from "./Spinner";

/**
 * JourneyCard — An evolving dashboard card that tells the story of a student's
 * path from active learning → course completion → Hall of Fame induction.
 *
 * Uses countdown mechanics throughout to build anticipation:
 * - Phase 1: Modules remaining until course completion
 * - Phase 2: Days remaining until HoF eligibility (30-day window)
 * - Phase 3: Post-induction member status
 */

const TOTAL_MODULES = 20;

const JourneyCard = ({
  completionData,
  loading,
  modulesCompleted = 0,
  onOptIn,
  onViewHoF,
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-md flex justify-center items-center min-h-[200px]">
        <Spinner size="medium" />
      </div>
    );
  }

  // ─── PHASE 3: Hall of Fame Member ────────────────────────────
  if (completionData?.hofJoinedAt) {
    const inductedDate = new Date(completionData.hofJoinedAt);
    const memberSince = inductedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <div className="rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-6 shadow-md border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center space-x-3 mb-4">
          <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Hall of Fame
          </h3>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Member since
            </p>
            <p className="text-lg font-bold text-gray-800 dark:text-white">
              {memberSince}
            </p>
          </div>

          {completionData.rank && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rank</p>
              <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                #{completionData.rank}
              </p>
            </div>
          )}

          {completionData.earlyOptIn && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 italic">
              Early inductee — you didn't wait for greatness.
            </p>
          )}
        </div>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 italic">
          Your name stands among the greats.
        </p>

        {onViewHoF && (
          <button
            onClick={onViewHoF}
            className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 bg-yellow-600 dark:bg-yellow-500 text-white rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors text-sm font-medium"
          >
            View Hall of Fame
            <ChevronRight className="h-4 w-4 ml-2" />
          </button>
        )}
      </div>
    );
  }

  // ─── PHASE 2: Course Complete — Countdown to HoF ─────────────
  if (completionData?.courseCompleted) {
    const eligibleDate = new Date(completionData.hofEligibleAt);
    const now = new Date();
    const daysRemaining = Math.max(
      0,
      Math.ceil((eligibleDate - now) / (1000 * 60 * 60 * 24)),
    );
    const totalWaitDays = 30;
    const daysPassed = totalWaitDays - daysRemaining;
    const progressPercent = Math.round((daysPassed / totalWaitDays) * 100);

    const formattedEligibleDate = eligibleDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 shadow-md border border-purple-200 dark:border-purple-800">
        <div className="flex items-center space-x-3 mb-4">
          <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Hall of Fame Countdown
          </h3>
        </div>

        <div className="space-y-4">
          {daysRemaining > 0 ? (
            <>
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {daysRemaining}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  day{daysRemaining !== 1 ? "s" : ""} until induction
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Waiting period</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-500 dark:bg-purple-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Automatic induction on {formattedEligibleDate}
              </p>
            </>
          ) : (
            <div className="text-center">
              <p className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
                You're eligible for induction!
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                The next processing cycle will welcome you to the Hall of Fame.
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center italic">
            Your 30-day waiting period gives current students their moment to
            shine.
          </p>

          <button
            onClick={onOptIn}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-purple-800 dark:bg-purple-500 dark:text-purple-950 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors text-sm font-medium"
          >
            <Star className="h-4 w-4 mr-2" />
            Join Hall of Fame Now
          </button>

          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Skip the wait — your choice won't affect your legacy.
          </p>
        </div>
      </div>
    );
  }

  // ─── PHASE 1: Active Learning — Modules Countdown ────────────
  const modulesRemaining = TOTAL_MODULES - modulesCompleted;
  const progressPercent = Math.round((modulesCompleted / TOTAL_MODULES) * 100);

  // Determine messaging based on progress
  const getMessage = () => {
    if (modulesRemaining <= 0) return null;
    if (modulesRemaining <= 2) {
      return "The Hall of Fame is within reach. One final push!";
    }
    if (modulesRemaining <= 5) {
      return "You're building something great. The Hall of Fame awaits.";
    }
    if (modulesRemaining <= 10) {
      return "Every module brings you closer to greatness.";
    }
    return "Your journey to the Hall of Fame has begun.";
  };

  const message = getMessage();

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-md">
      <div className="flex items-center space-x-3 mb-4">
        <Target className="h-6 w-6 text-theme" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Journey to Hall of Fame
        </h3>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <p className="text-4xl font-bold text-theme">{modulesRemaining}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            module{modulesRemaining !== 1 ? "s" : ""} until course completion
          </p>
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Course progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-theme h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {message && (
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center italic">
            {message}
          </p>
        )}

        <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
          Complete all 20 modules to begin your Hall of Fame countdown
        </p>
      </div>
    </div>
  );
};

export default JourneyCard;
