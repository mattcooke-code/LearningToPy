import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient, useAuth, useTheme } from "../context";
import { useStreakNotifications, useThemeStyles } from "../hooks";
import {
  ProgressGauge,
  BackToTopButton,
  SegmentedLevelProgressBar,
  Spinner,
  LeaderboardRow,
} from "../components/ui";
import { LeaderboardModal } from "../modals";
import { BADGES_BY_ID } from "../data/badges";
import { ArrowRight, BookOpen, CheckCircle } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { updateThemeFromCourseProgress } = useTheme();
  const { themeColor, hoverHandlers } = useThemeStyles();
  const [userProgress, setUserProgress] = useState(null);
  const [surroundingLeaderboard, setSurroundingLeaderboard] = useState(null);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [nextModule, setNextModule] = useState(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchProgress = async () => {
      try {
        const progressData = await apiClient.get("/progress/current");
        setUserProgress(progressData);
        updateThemeFromCourseProgress(progressData.courseProgressPercentage);

        if (progressData.currentModule) {
          const nextOrder = progressData.currentModule.order + 1;
          setNextModule({
            order: nextOrder,
            title: `Module ${nextOrder}`,
          });
        } else if (progressData.level >= 20) {
          setNextModule(null);
        }
      } catch (err) {
        console.error("Failed to fetch progress:", err);
      }
    };

    const fetchSurroundingLeaderboard = async () => {
      try {
        setLeaderboardLoading(true);
        const leaderboardData = await apiClient.get(
          "/progress/leaderboard/around-me",
        );
        setSurroundingLeaderboard(leaderboardData);
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

  const progressData = userProgress || {
    xp: user?.xp || 0,
    level: user?.level || 1,
    streak: user?.streak || 0,
    courseProgressPercentage: 0,
    progress: {},
    stats: {
      lessonsCompleted: 0,
      modulesCompleted: 0,
    },
    badges: [],
    currentModule: null,
  };

  const isCourseComplete = progressData.level >= 20;

  useStreakNotifications(
    progressData.streak,
    progressData.streakStatus,
    progressData.weeklyProgress,
  );

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
    <div className="container mx-auto px-4 py-8  ">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-python-blue dark:text-python-yellow">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Watch your <strong>code pressure</strong> decrease as your skills
          increase!
        </p>
      </div>

      {/* Progress Overview with Side-by-side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Progress Gauge - takes 2/3 width */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
            Your Python Progress
          </h2>
          <div className="flex justify-center">
            <ProgressGauge
              progress={progressData.courseProgressPercentage}
              size={280}
            />
          </div>
          <p className="text-center text-gray-600 dark:text-gray-300 mt-4">
            Currently at <strong>Level {progressData.level}</strong> with{" "}
            <strong>{progressData.xp} XP</strong>
          </p>
        </div>

        {/* Your Competitive Zone - takes 1/3 width */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Your Competitive Zone
          </h3>

          {leaderboardLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="medium" />
            </div>
          ) : surroundingLeaderboard ? (
            <div className="space-y-3">
              {surroundingLeaderboard.users?.map((player) => (
                <LeaderboardRow
                  key={player.rank}
                  rank={player.rank}
                  user={player}
                  isCurrent={player.isCurrent}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Leaderboard data unavailable
              </p>
            </div>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLeaderboardModalOpen(true)}
              className="text-python-blue dark:text-python-light hover:underline font-medium"
            >
              View Full Leaderboard →
            </button>
          </div>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 text-center mb-4">
            Current Level
          </h3>
          <p className="text-4xl font-bold text-python-blue dark:text-python-blue text-center mb-4">
            {progressData.level}
          </p>
          <SegmentedLevelProgressBar
            currentLevel={progressData.level}
            currentModule={progressData.currentModule}
            lessonsCompleted={progressData.currentModule?.lessonsCompleted || 0}
            totalLessons={progressData.currentModule?.lessonCount || 0}
            showLabels={true}
          />
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            {progressData.currentModule?.lessonsCompleted || 0} /{" "}
            {progressData.currentModule?.lessonCount || 0} lessons in current
            module
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Total XP
          </h3>
          <p className="text-3xl font-bold text-python-yellow dark:text-python-yellow mt-2">
            {progressData.xp}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Current Streak
          </h3>
          <p className="text-3xl font-bold text-green-500 dark:text-green-400 mt-2">
            {progressData.streak}
          </p>
        </div>
      </div>

      {/* Continue Learning Section with Next Module Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center mb-8">
        {isCourseComplete ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              🎉 Congratulations, Python Master! 🎉
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You've completed all 20 modules! Your Python journey is complete,
              but there's always more to learn. Check out advanced topics or
              help others on their journey.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/modules"
                style={{ backgroundColor: themeColor }}
                {...hoverHandlers}
                className="text-white px-6 py-3 rounded-lg font-semibold transition inline-flex items-center"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Review Modules
              </Link>
              <Link
                to="/terminal"
                className="bg-gray-600 dark:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 dark:hover:bg-gray-600 transition inline-flex items-center"
              >
                Practice in Terminal
              </Link>
            </div>
          </>
        ) : progressData.currentModule ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Continue Learning
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              You're currently working on{" "}
              <strong className="text-python-blue dark:text-python-yellow">
                Module {progressData.currentModule.order}:{" "}
                {progressData.currentModule.title}
              </strong>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {progressData.currentModule.lessonsCompleted} of{" "}
              {progressData.currentModule.lessonCount} lessons completed
            </p>

            {/* Next Module Preview */}
            {!progressData.currentModule.isComplete && (
              <div className="mt-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 max-w-md mx-auto">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  After this module, you'll unlock:
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 font-bold">
                        {progressData.currentModule.order + 1}
                      </span>
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200 px-3">
                      Module {progressData.currentModule.order + 1}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    More advanced Python concepts
                  </span>
                </div>
              </div>
            )}

            <Link
              to={`/modules`}
              style={{ backgroundColor: themeColor }}
              {...hoverHandlers}
              className="text-white px-8 py-3 rounded-lg font-semibold transition inline-flex items-center"
            >
              Continue Module {progressData.currentModule.order}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Ready to start learning?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Begin your Python journey with Module 1: Python Fundamentals
            </p>
            <Link
              to="/modules/1"
              style={{ backgroundColor: themeColor }}
              {...hoverHandlers}
              className="text-white px-8 py-3 rounded-lg font-semibold transition inline-flex items-center"
            >
              Start Learning
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </>
        )}
      </div>

      {/* Enhanced sections with real data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Recent Badges
          </h3>
          {recentBadges.length > 0 ? (
            <div className="flex flex-col space-y-3">
              {recentBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center space-x-3 rounded-xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2"
                >
                  <div className="h-12 w-12 overflow-hidden rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-100 dark:bg-yellow-900/30">
                    {badge.image ? (
                      <img
                        src={badge.image}
                        alt={badge.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                        {badge.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                      {badge.name}
                    </p>
                    {badge.description && (
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">
                        {badge.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              No badges earned yet. Complete lessons to earn badges!
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Progress Overview
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-700 dark:text-gray-300">
                Lessons Completed
              </p>
              <p className="text-lg font-semibold text-python-blue dark:text-python-light">
                {progressData.stats?.lessonsCompleted || 0}
              </p>
            </div>
            <div>
              <p className="text-gray-700 dark:text-gray-300">
                Modules Completed
              </p>
              <p className="text-lg font-semibold text-python-blue dark:text-python-light">
                {progressData.stats?.modulesCompleted || 0} / 20
              </p>
            </div>
            {!isCourseComplete && progressData.currentModule && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 mb-1">Next Up</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      Module {progressData.currentModule.order}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {progressData.currentModule.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      {progressData.currentModule.lessonsCompleted} /{" "}
                      {progressData.currentModule.lessonCount} lessons
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Complete to level up!
                    </p>
                  </div>
                </div>
              </div>
            )}
            {isCourseComplete && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <p className="font-semibold">Course Complete!</p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  You've mastered all 20 modules. Great job!
                </p>
              </div>
            )}
          </div>
          <BackToTopButton />
        </div>
      </div>

      {/* Full Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardModalOpen}
        onClose={() => setIsLeaderboardModalOpen(false)}
        userRank={surroundingLeaderboard?.currentUserRank}
        surroundingUsers={surroundingLeaderboard?.users || []}
      />
    </div>
  );
};

export default Dashboard;
