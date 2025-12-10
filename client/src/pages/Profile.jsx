import { useEffect, useMemo, useState } from "react";
import { Award, Sparkles, Target, TrendingUp } from "lucide-react";
import { apiClient, useAuth } from "../context";
import { useThemeStyles } from "../hooks/useThemeStyles";
import {
  Spinner,
  BackToTopButton,
  SegmentedLevelProgressBar,
} from "../components/ui";
import { BadgeModal } from "../components/modals";
import PrivacySettings from "../components/settings/PrivacySettings";
import { BADGE_LIBRARY, BADGES_BY_ID } from "../data/badges";
import { getErrorMessage } from "../utils/getErrorMessage";

const Profile = () => {
  const { user, updateUser, triggerLeaderboardRefresh } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [achievements, setAchievements] = useState({
    earnedBadges: [],
    inProgress: [],
    locked: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { themeColor, hoverHandlers } = useThemeStyles();

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/progress/achievements");
        setAchievements({
          earnedBadges: response.data.earnedBadges || [],
          inProgress: response.data.inProgress || [],
          locked: response.data.locked || [],
        });
      } catch (err) {
        console.error("Failed to load achievements:", err);
        setError(
          getErrorMessage(
            err,
            "We couldn't load your badge progress. Please try again shortly."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const handlePrivacyUpdate = (newPrivacySettings) => {
    updateUser({ privacySettings: newPrivacySettings });
    triggerLeaderboardRefresh();
  };

  const earnedBadgeIds = useMemo(
    () => achievements.earnedBadges.map((badge) => badge.id),
    [achievements.earnedBadges]
  );

  const progressMap = useMemo(() => {
    const map = {};
    achievements.inProgress.forEach((badge) => {
      map[badge.id] = badge.progressPercentage ?? 0;
    });
    achievements.locked.forEach((badge) => {
      map[badge.id] = badge.progressPercentage ?? 0;
    });
    achievements.earnedBadges.forEach((badge) => {
      map[badge.id] = 100;
    });
    return map;
  }, [achievements]);

  const earnedBadgesDetailed = useMemo(() => {
    const seen = new Set();
    return achievements.earnedBadges
      .map((earned) => {
        if (seen.has(earned.id)) return null;
        seen.add(earned.id);
        const libraryBadge = BADGES_BY_ID[earned.id];
        return {
          ...libraryBadge,
          ...earned,
          image: libraryBadge?.image,
          category: libraryBadge?.category || earned.category,
          description: libraryBadge?.description || earned.description,
        };
      })
      .filter(Boolean);
  }, [achievements.earnedBadges]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header Section */}
      <div className="mb-10 rounded-3xl bg-linear-to-br bg-python-blue p-8 text-white shadow-lg">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-white">
              Profile
            </p>
            <h1 className="mt-3 text-4xl font-bold lg:text-5xl text-python-yellow">
              Welcome back, {user?.username}
            </h1>
            <p className="mt-3 max-w-2xl text-white">
              Track your learning milestones, celebrate your achievements, and
              see every badge you&apos;ve unlocked along the way.
            </p>
          </div>

          <div className="rounded-2xl p-6 backdrop-blur bg-python-yellow text-python-blue">
            <p className="flex items-center text-sm font-medium uppercase tracking-wide text-python-blue">
              <Sparkles className="mr-2 h-4 w-4" /> Earned Badges
            </p>
            <p className="mt-1 text-4xl font-bold">
              {earnedBadgeIds.length.toString().padStart(2, "0")}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Stats Section */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Level Progress Card */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center space-x-2">
            <Target className="h-5 w-5 " style={{ color: themeColor }} />
            <h3 className="text-lg font-semibold text-gray-800">
              Level Progress
            </h3>
          </div>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Current Level</p>
              <p className="text-5xl font-bold " style={{ color: themeColor }}>
                {user?.level || 1}
              </p>
            </div>
            <SegmentedLevelProgressBar
              currentXP={user?.xp || 0}
              segmentCount={10}
              showLabels={true}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <div className="text-center">
                <p className="font-medium">Total XP</p>
                <p className="text-lg font-bold text-python-yellow">
                  {user?.xp || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="font-medium">Current Streak</p>
                <p className="text-lg font-bold text-green-500">
                  {user?.streak || 0} days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ FIX 2: Pass function reference, don't call it */}
        <PrivacySettings user={user} onUpdate={handlePrivacyUpdate} />

        {/* Learning Stats Card */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-python-blue" />
            <h3 className="text-lg font-semibold text-gray-800">
              Learning Stats
            </h3>
          </div>
          <div className="space-y-4">
            {[
              {
                label: "Days Active",
                value: user?.stats?.daysActive || "0",
                color: "text-blue-600",
                icon: "📅",
              },
              {
                label: "Avg. Score",
                value: user?.stats?.averageScore
                  ? `${user.stats.averageScore}%`
                  : "N/A",
                color: "text-green-600",
                icon: "🎯",
              },
              {
                label: "Completion Rate",
                value: user?.stats?.completionRate
                  ? `${user.stats.completionRate}%`
                  : "N/A",
                color: "text-purple-600",
                icon: "✅",
              },
              {
                label: "Fast Completions",
                value: user?.stats?.fastCompletions || "0",
                color: "text-yellow-600",
                icon: "⚡",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{stat.icon}</span>
                  <span className="font-medium text-gray-700">
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

      {/* Badge Collection Section */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">
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

      {loading ? (
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <Spinner />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center shadow-sm">
          <p className="text-red-700">{error}</p>
        </div>
      ) : earnedBadgesDetailed.length === 0 ? (
        <div className="rounded-3xl  p-8 text-center shadow-sm bg-python-yellow">
          <h3 className="text-xl font-semibold text-python-blue">
            No badges yet... but not for long!
          </h3>
          <p className="mt-2 text-python-blue">
            Complete lessons, keep your streak alive, and explore new modules to
            start earning badges.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {earnedBadgesDetailed.map((badge) => (
            <div
              key={badge.id}
              className="group flex h-full flex-col rounded-3xl border border-green-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-green-200 bg-green-50">
                  {badge.image ? (
                    <img
                      src={badge.image}
                      alt={badge.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-green-500">
                      {badge.name.charAt(0)}
                    </div>
                  )}
                  <span className="absolute -top-1 -right-1 rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white">
                    Earned
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-green-600">
                    {badge.category || "Badge"}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {badge.name}
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">{badge.description}</p>
            </div>
          ))}
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
