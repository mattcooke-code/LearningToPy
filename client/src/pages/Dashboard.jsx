import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient, useAuth, useTheme } from "../context";
import { useThemeStyles } from "../hooks";
import {
  ProgressGauge,
  BackToTopButton,
  SegmentedLevelProgressBar,
  Spinner,
  LeaderboardRow,
} from "../components/ui";
import { FullLeaderboardModal } from "../components/modals";
import { BADGES_BY_ID } from "../data/badges";

const Dashboard = () => {
  const { user } = useAuth();
  const { updateThemeFromCourseProgress } = useTheme();
  const { themeColor, hoverHandlers } = useThemeStyles();
  const [userProgress, setUserProgress] = useState(null);
  const [surroundingLeaderboard, setSurroundingLeaderboard] = useState(null);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchProgress = async () => {
      try {
        const response = await apiClient.get("/progress/current");
        setUserProgress(response.data.data);
        updateThemeFromCourseProgress(
          response.data.data.courseProgressPercentage
        );
      } catch (err) {
        console.error("Failed to fetch progress:", err);
      }
    };

    const fetchSurroundingLeaderboard = async () => {
      try {
        setLeaderboardLoading(true);
        const response = await apiClient.get("/progress/leaderboard/around-me");
        setSurroundingLeaderboard(response.data.data);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        setSurroundingLeaderboard(null);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    fetchProgress();
    fetchSurroundingLeaderboard();
  }, [updateThemeFromCourseProgress, user]);

  // Use userProgress data instead of user data for progress-related info
  const progressData = userProgress || {
    xp: user?.xp || 0,
    level: user?.level || 1,
    streak: user?.streak || 0,
    courseProgressPercentage: 0,
    nextLevelXp: 100,
    completedLessonsCount: 0,
    completedModulesCount: 0,
    badges: [],
  };

  const recentBadges = (progressData.badges || [])
    .slice()
    .reverse()
    .filter(Boolean)
    .slice(0, 3)
    .map((badgeId) => {
      const libraryBadge = BADGES_BY_ID[badgeId];
      return {
        id: badgeId,
        name: libraryBadge?.name || badgeId,
        description: libraryBadge?.description,
        image: libraryBadge?.image,
      };
    });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-python-blue">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-600 mt-2">
          Watch your <strong>code pressure</strong> decrease as your skills
          increase!
        </p>
      </div>

      {/* Progress Overview with Side-by-side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Progress Gauge - takes 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Your Python Progress
          </h2>
          <div className="flex justify-center">
            <ProgressGauge
              progress={progressData.courseProgressPercentage}
              size={280}
            />
          </div>
          <p className="text-center text-gray-600 mt-4">
            Currently at <strong>Level {progressData.level}</strong> with{" "}
            <strong>{progressData.xp} XP</strong>
          </p>
        </div>

        {/* Your Competitive Zone - takes 1/3 width */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Your Competitive Zone
          </h3>

          {leaderboardLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="medium" />
            </div>
          ) : surroundingLeaderboard ? (
            <div className="space-y-3">
              {surroundingLeaderboard.users.map((player) => (
                <LeaderboardRow
                  key={player.rank}
                  rank={player.rank}
                  user={player}
                  isCurrent={player.isCurrent}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-gray-500 text-sm">
                Leaderboard data unavailable
              </p>
            </div>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLeaderboardModalOpen(true)}
              className="text-python-blue hover:underline font-medium"
            >
              View Full Leaderboard →
            </button>
          </div>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 text-center mb-4">
            Current Level
          </h3>
          <p className="text-4xl font-bold text-python-blue text-center mb-4">
            {progressData.level}
          </p>
          {/* Note: You'll need to import and use SegmentedLevelProgress here */}
          {
            <SegmentedLevelProgressBar
              currentXP={progressData.xp}
              showDetails={false}
            />
          }
          <div className="text-center text-sm text-gray-500 mt-2">
            {progressData.xp % 100}/100 XP this level
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-700">Total XP</h3>
          <p className="text-3xl font-bold text-python-yellow mt-2">
            {progressData.xp}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-700">
            Current Streak
          </h3>
          <p className="text-3xl font-bold text-green-500 mt-2">
            {progressData.streak}
          </p>
        </div>
      </div>

      {/* Continue Learning */}
      <div className="bg-white rounded-lg shadow-md p-8 text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Ready to continue learning?
        </h2>
        <Link
          to="/modules"
          style={{ backgroundColor: themeColor }}
          {...hoverHandlers}
          className="text-white px-8 py-3 rounded-lg font-semibold  transition inline-block"
        >
          Continue Learning
        </Link>
      </div>

      {/* Enhanced sections with real data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Badges
          </h3>
          {recentBadges.length > 0 ? (
            <div className="flex flex-col space-y-3">
              {recentBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center space-x-3 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2"
                >
                  <div className="h-12 w-12 overflow-hidden rounded-lg border border-yellow-200 bg-yellow-100">
                    {badge.image ? (
                      <img
                        src={badge.image}
                        alt={badge.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-yellow-600">
                        {badge.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-800">
                      {badge.name}
                    </p>
                    {badge.description && (
                      <p className="text-xs text-yellow-700">
                        {badge.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">
              No badges earned yet. Complete lessons to earn badges!
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Progress Overview
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-gray-700">Lessons Completed</p>
              <p className="text-lg font-semibold text-python-blue">
                {progressData.completedLessonsCount}
              </p>
            </div>
            <div>
              <p className="text-gray-700">Modules Completed</p>
              <p className="text-lg font-semibold text-python-blue">
                {progressData.completedModulesCount}
              </p>
            </div>
            <div>
              <p className="text-gray-700">Next Level In</p>
              <p className="text-lg font-semibold text-python-yellow">
                {progressData.nextLevelXp} XP
              </p>
            </div>
          </div>
          <BackToTopButton />
        </div>
      </div>

      {/* Full Leaderboard Modal */}
      <FullLeaderboardModal
        isOpen={isLeaderboardModalOpen}
        onClose={() => setIsLeaderboardModalOpen(false)}
        userRank={surroundingLeaderboard?.currentUserRank}
        surroundingUsers={surroundingLeaderboard?.users || []}
      />
    </div>
  );
};

export default Dashboard;
