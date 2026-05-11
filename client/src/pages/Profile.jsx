import { useMemo, useState } from "react";
import { Award, Sparkles, Target, TrendingUp } from "lucide-react";
import { useAuth, useTheme } from "../context";
import { useDashboardData, useThemeStyles } from "../hooks";
import {
  BackToTopButton,
  SegmentedLevelProgressBar,
  LoadingState,
} from "../components/ui";
import { BadgeModal } from "../modals";
import PrivacySettings from "../components/settings/PrivacySettings";
import { BADGES_BY_ID } from "../data/badges";

/**
 * @fileoverview
 * Comprehensive user profile page displaying learning progress, achievements, badges, and privacy settings.
 * This page uses the useDashboardData hook for all data fetching needs, including progress,
 * achievements, and badge collection. Features responsive design, theme integration, and modal
 * interactions for detailed badge viewing and privacy management.
 */

/**
 * User profile page component displaying comprehensive learning progress and achievements.
 *
 * This component presents a complete overview of user's learning journey including level progress,
 * XP statistics, badge collection, learning metrics, and privacy settings. All data fetching is
 * delegated to the useDashboardData hook for consistent state management across the application.
 * Provides interactive elements for badge viewing and settings management with responsive design.
 *
 * @component
 * @returns {JSX.Element} Complete user profile with progress, badges, and settings
 *
 * @stateManagement
 * - isModalOpen: Modal state for detailed badge viewing
 * - All data fetching and loading states managed by useDashboardData hook
 *
 * @dataFetching
 * - All API calls delegated to useDashboardData hook
 * - Fetches progress, leaderboard, and achievements in parallel
 * - Consistent error handling and loading states
 *
 * @progressDisplay
 * - Level progress with SegmentedLevelProgressBar component
 * - XP and streak statistics display
 * - Learning metrics (days active, completion rate, etc.)
 * - Theme-aware color styling throughout
 *
 * @badgeSystem
 * - Grid layout for earned badges with hover effects
 * - Badge modal for detailed viewing
 * - Fallback display for badges without images
 * - "View more" button for large collections
 * - Accessibility attributes for badge interactions
 *
 * @privacyIntegration
 * - PrivacySettings component integration
 * - Real-time updates to user privacy settings
 * - Leaderboard refresh trigger on privacy changes
 * - User context integration for settings persistence
 *
 * @themeIntegration
 * - Dynamic theming via useThemeStyles hook
 * - Consistent color application across components
 * - Hover effects and transitions
 * - Dark mode support throughout
 *
 * @responsiveDesign
 * - Mobile-first responsive layout
 * - Adaptive grid layouts for badges
 * - Flexible card layouts for statistics
 * - Touch-friendly interactive elements
 */
const Profile = () => {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    updateUser,
    triggerLeaderboardRefresh,
  } = useAuth();
  const { updateThemeFromCourseProgress } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { themeColor, hoverHandlers } = useThemeStyles();

  // Use the shared hook for all data fetching
  const { userProgress, earnedBadgeIds, loading, error } = useDashboardData(
    user,
    isAuthenticated,
    authLoading,
    window.location.pathname,
    updateThemeFromCourseProgress,
  );

  const handlePrivacyUpdate = (newPrivacySettings) => {
    updateUser({ privacySettings: newPrivacySettings });
    triggerLeaderboardRefresh();
  };

  const progressMap = useMemo(() => ({}), []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Show loading state while authentication is being verified
  if (authLoading) {
    return (
      <LoadingState
        message="Verifying your identity..."
        height="min-h-[50vh]"
      />
    );
  }

  // Show message if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Header Section */}
      <div className="mb-10 rounded-3xl bg-linear-to-br bg-python-dark p-8 text-white shadow-lg dark:bg-python-blue ">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-white/80">
              Profile
            </p>
            <h1 className="mt-3 text-4xl font-bold lg:text-5xl text-python-yellow">
              Welcome back, {user?.username}
            </h1>
            <p className="mt-3 max-w-2xl text-white/90">
              Track your learning milestones, celebrate your achievements, and
              see every badge you&apos;ve unlocked along the way.
            </p>
          </div>

          <div className="rounded-2xl p-6 backdrop-blur bg-python-yellow text-python-blue">
            <p className="flex items-center text-sm font-medium uppercase tracking-wide text-python-blue">
              <Sparkles className="mr-2 h-4 w-4" /> Earned Badges
            </p>
            <p className="mt-1 text-4xl font-bold">
              {loading
                ? "..."
                : earnedBadgeIds.length.toString().padStart(2, "0")}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Stats Section */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Level Progress Card */}
        <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-md">
          <div className="mb-4 flex items-center space-x-2">
            <Target className="h-5 w-5" style={{ color: themeColor }} />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Level Progress
            </h3>
          </div>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Current Level
              </p>
              <p className="text-5xl font-bold" style={{ color: themeColor }}>
                {userProgress?.level || user?.level || 1}
              </p>
            </div>
            <SegmentedLevelProgressBar
              currentLevel={userProgress?.level || 1}
              currentModule={userProgress?.currentModule}
              lessonsCompleted={
                userProgress?.currentModule?.lessonsCompleted || 0
              }
              totalLessons={userProgress?.currentModule?.lessonCount || 0}
              showLabels={true}
            />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="text-center">
                <p className="font-medium">Total XP</p>
                <p className="text-lg font-bold text-python-yellow dark:text-python-yellow">
                  {userProgress?.xp || user?.xp || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="font-medium">Current Streak</p>
                <p className="text-lg font-bold text-green-500 dark:text-green-400">
                  {user?.streak || 0} days
                </p>
              </div>
            </div>
          </div>
        </div>

        <PrivacySettings user={user} onUpdate={handlePrivacyUpdate} />

        {/* Learning Stats Card */}
        <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-md">
          <div className="mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-python-blue dark:text-python-blue" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Learning Stats
            </h3>
          </div>
          <div className="space-y-4">
            {[
              {
                label: "Days Active",
                value:
                  userProgress?.stats?.daysActive ||
                  user?.stats?.daysActive ||
                  "0",
                color: "text-blue-600 dark:text-blue-400",
                icon: "📅",
              },
              {
                label: "Avg. Score",
                value: user?.stats?.averageScore
                  ? `${user.stats.averageScore}%`
                  : "N/A",
                color: "text-green-600 dark:text-green-400",
                icon: "🎯",
              },
              {
                label: "Completion Rate",
                value: user?.stats?.completionRate
                  ? `${user.stats.completionRate}%`
                  : "N/A",
                color: "text-purple-600 dark:text-purple-400",
                icon: "✅",
              },
              {
                label: "Fast Completions",
                value: user?.stats?.fastCompletions || "0",
                color: "text-yellow-600 dark:text-yellow-400",
                icon: "⚡",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{stat.icon}</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {stat.label}
                  </span>
                </div>
                <span className={`text-lg font-bold ${stat.color}`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badge Collection */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Your Badge Collection
        </h2>
        <button
          onClick={openModal}
          className="inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition"
          style={{ backgroundColor: themeColor }}
          {...hoverHandlers}
        >
          <Award className="mr-2 h-4 w-4" />
          View All Badges
        </button>
      </div>

      {/* Badge Collection Content */}
      {loading ? (
        <LoadingState
          message="Loading your badges..."
          height="h-48"
          spinnerSize="md"
        />
      ) : error ? (
        <div className="rounded-3xl border border-red-100 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-8 text-center shadow-sm">
          <p className="text-red-700 dark:text-red-400">
            We couldn't load your badge progress. Please try again shortly.
          </p>
        </div>
      ) : earnedBadgeIds.length === 0 ? (
        <div className="rounded-3xl p-8 text-center shadow-sm bg-python-yellow dark:bg-yellow-900/30">
          <h3 className="text-xl font-semibold text-python-blue dark:text-yellow-300">
            No badges yet... but not for long!
          </h3>
          <p className="mt-2 text-python-blue dark:text-yellow-300/80">
            Complete lessons, keep your streak alive, and explore new modules to
            start earning badges.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {earnedBadgeIds.map((badgeId) => {
            const badge = BADGES_BY_ID[badgeId];
            const badgeName = badge?.name || badgeId;
            const badgeImage = badge?.image;

            return (
              <div
                key={badgeId}
                className="group relative flex aspect-square items-center justify-center rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-1 transition hover:-translate-y-0.5 hover:shadow-md hover:border-green-400 dark:hover:border-green-600 cursor-pointer"
                onClick={openModal}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && openModal()}
                aria-label={`View details for ${badgeName} badge`}
              >
                {badgeImage ? (
                  <img
                    src={badgeImage}
                    alt={badgeName}
                    className="h-full w-full rounded-lg object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-lg font-semibold">
                    {badgeName.charAt(0)}
                  </div>
                )}
                <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-green-900/0 opacity-0 transition group-hover:bg-green-900/10 dark:group-hover:bg-green-500/10 group-hover:opacity-100">
                  <span className="text-xs font-medium text-green-700 dark:text-green-400 opacity-0 group-hover:opacity-100 transition">
                    ✓
                  </span>
                </span>
              </div>
            );
          })}

          {earnedBadgeIds.length > 24 && (
            <button
              onClick={openModal}
              className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm font-medium transition hover:border-green-400 dark:hover:border-green-600 hover:text-green-600 dark:hover:text-green-400"
              aria-label="View all earned badges"
            >
              +{earnedBadgeIds.length - 24} more
            </button>
          )}
        </div>
      )}

      <BackToTopButton />

      <BadgeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        earnedBadgeIds={earnedBadgeIds}
        progressMap={progressMap}
      />
    </div>
  );
};

export default Profile;
