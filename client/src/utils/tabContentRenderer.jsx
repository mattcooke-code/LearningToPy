// utils/tabContentRenderer.jsx
import { AlertTriangle, CheckCircle, Users, BarChart3 } from "lucide-react";

export const renderTabSpecificContent = (tab, settings) => {
  switch (tab) {
    case "theme":
      return (
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Theme Preview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className="rounded-lg p-6 border-2"
              style={{
                backgroundColor: settings.themeColor,
                borderColor: settings.themeColor,
              }}
            >
              <p className="text-white font-medium">Primary Color</p>
              <p className="text-white text-sm opacity-90">
                {settings.themeColor}
              </p>
            </div>
            <div
              className={`rounded-lg p-6 border border-gray-200 dark:border-gray-700 ${
                settings.codeTheme === "dark"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-50 text-gray-900"
              }`}
            >
              <p className="font-medium">Code Editor</p>
              <p className="text-sm opacity-90">{settings.codeTheme} theme</p>
            </div>
            <div
              className={`rounded-lg p-6 border border-gray-200 dark:border-gray-700 ${
                settings.defaultTheme === "dark"
                  ? "bg-gray-900 text-white"
                  : settings.defaultTheme === "light"
                  ? "bg-white text-gray-900"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="font-medium">UI Theme</p>
              <p className="text-sm opacity-90">{settings.defaultTheme}</p>
            </div>
          </div>
        </div>
      );

    case "gamification":
      return (
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            XP Calculation Preview
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Level 1 → Level 2
                </span>
                <span className="font-medium">
                  {settings.xpPerLevel} XP required
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Module Completion
                </span>
                <span className="font-medium">
                  +{settings.moduleXpBonus} XP bonus
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  7-Day Streak
                </span>
                <span className="font-medium">
                  {settings.dailyStreakReward} ×{" "}
                  {settings.streakBonusMultiplier} ={" "}
                  {Math.round(
                    settings.dailyStreakReward * settings.streakBonusMultiplier
                  )}{" "}
                  XP/day
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
                <span className="font-medium text-gray-900 dark:text-white">
                  Total for active week
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  ~
                  {settings.dailyStreakReward *
                    7 *
                    settings.streakBonusMultiplier +
                    settings.moduleXpBonus +
                    settings.weeklyChallengeBonus}{" "}
                  XP
                </span>
              </div>
            </div>
          </div>
        </div>
      );

    case "features":
      return (
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Platform Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-lg border ${
                settings.maintenanceMode
                  ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
                  : "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`h-10 w-10 rounded-full ${
                    settings.maintenanceMode
                      ? "bg-yellow-100 dark:bg-yellow-900"
                      : "bg-green-100 dark:bg-green-900"
                  } flex items-center justify-center mr-3`}
                >
                  {settings.maintenanceMode ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {settings.maintenanceMode
                      ? "Maintenance Mode"
                      : "Operational"}
                  </p>
                  <p className="text-sm opacity-75">
                    {settings.maintenanceMode
                      ? "Read-only mode active"
                      : "All systems normal"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">
                    {settings.allowRegistrations
                      ? "Open Registration"
                      : "Closed Registration"}
                  </p>
                  <p className="text-sm opacity-75">
                    {settings.allowRegistrations
                      ? "New users can sign up"
                      : "Registration disabled"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
                  <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium">
                    {settings.enableLeaderboards ? "Competitive" : "Casual"}
                  </p>
                  <p className="text-sm opacity-75">
                    {settings.enableLeaderboards
                      ? "Leaderboards enabled"
                      : "No rankings"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case "security":
      return (
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Security Recommendations
          </h3>
          <div className="space-y-3">
            {!settings.requireEmailVerification && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">
                    Enable Email Verification
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Recommended to prevent spam accounts and improve security
                  </p>
                </div>
              </div>
            )}

            {!settings.requireStrongPassword && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">
                    Enable Strong Passwords
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Require at least 8 characters with mixed case, numbers, and
                    symbols
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
};
