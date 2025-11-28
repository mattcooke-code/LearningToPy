import { useEffect, useMemo, useState } from "react";
import { Award, Sparkles } from "lucide-react";
import { apiClient, useAuth } from "../context";
import { Spinner, BackToTopButton, BadgeModal } from "../components/ui";
import { BADGE_LIBRARY, BADGES_BY_ID } from "../data/badges";
import { getErrorMessage } from "../utils/getErrorMessage";

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [achievements, setAchievements] = useState({
    earnedBadges: [],
    inProgress: [],
    locked: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <div className="mb-10 rounded-3xl bg-linear-to-br from-blue-600 via-blue-500 to-blue-700 p-8 text-white shadow-lg">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-blue-100">
              Profile
            </p>
            <h1 className="mt-3 text-4xl font-bold lg:text-5xl">
              Welcome back, {user?.username}
            </h1>
            <p className="mt-3 max-w-2xl text-blue-100">
              Track your learning milestones, celebrate your achievements, and
              see every badge you&apos;ve unlocked along the way.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
            <p className="flex items-center text-sm font-medium uppercase tracking-wide text-blue-100">
              <Sparkles className="mr-2 h-4 w-4" /> Earned Badges
            </p>
            <p className="mt-1 text-4xl font-bold">
              {earnedBadgeIds.length.toString().padStart(2, "0")}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Your Badge Collection
        </h2>
        <button
          onClick={openModal}
          className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
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
        <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50/60 p-8 text-center shadow-sm">
          <h3 className="text-xl font-semibold text-blue-700">
            No badges yet... but not for long!
          </h3>
          <p className="mt-2 text-blue-600">
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
