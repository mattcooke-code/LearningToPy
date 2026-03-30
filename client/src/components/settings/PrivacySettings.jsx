// PrivacySettings.jsx
import { useState, useEffect } from "react";
import { Shield, Eye, EyeOff, User } from "lucide-react";
import { apiClient } from "../../context";
import { useThemeStyles } from "../../hooks";

const PrivacySettings = ({ user, onUpdate }) => {
  const [settings, setSettings] = useState({
    showOnLeaderboards: true,
    showAsAnonymous: false,
    showUsernameOnLeaderboards: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const { themeColor, hoverHandlers } = useThemeStyles();

  // Initialize with user's current settings
  useEffect(() => {
    if (user?.privacySettings) {
      setSettings({
        showOnLeaderboards: user.privacySettings.showOnLeaderboards ?? true,
        showAsAnonymous: user.privacySettings.showAsAnonymous ?? false,
        showUsernameOnLeaderboards:
          user.privacySettings.showUsernameOnLeaderboards ?? true,
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      const data = await apiClient.patch("/auth/privacy-settings", settings);

      if (onUpdate && data.privacySettings) {
        onUpdate(data.privacySettings);
      } else if (onUpdate) {
        onUpdate(settings);
      }

      setMessage({
        type: "success",
        text: "Privacy settings updated successfully!",
      });

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    } catch (err) {
      console.error("Failed to update privacy settings:", err);
      setMessage({
        type: "error",
        text: "Failed to update settings. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLeaderboard = (checked) => {
    const newShowUsername = checked
      ? settings.showUsernameOnLeaderboards
      : false;

    const newSettings = {
      showOnLeaderboards: checked,
      showAsAnonymous: checked && !newShowUsername,
      showUsernameOnLeaderboards: newShowUsername,
    };
    setSettings(newSettings);
  };

  const handleToggleUsername = (checked) => {
    const newShowAsAnonymous = settings.showOnLeaderboards && !checked;

    setSettings({
      ...settings,
      showUsernameOnLeaderboards: checked,
      showAsAnonymous: newShowAsAnonymous,
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <div className="mb-6 flex items-center space-x-3">
        <Shield className="h-6 w-6 text-python-blue dark:text-python-blue" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Privacy Settings
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-100">
            Control how you appear to other learners
          </p>
        </div>
      </div>
      <div className="space-y-6">
        {/* Leaderboard Visibility */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                {settings.showOnLeaderboards ? (
                  <Eye className="h-5 w-5 text-python-blue" />
                ) : (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Show on Leaderboards
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-100">
                  Appear in global and module rankings
                </p>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.showOnLeaderboards}
                onChange={(e) => handleToggleLeaderboard(e.target.checked)}
                className="peer sr-only"
              />
              <div
                className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"
                style={{
                  backgroundColor: settings.showOnLeaderboards
                    ? themeColor
                    : undefined,
                }}
              ></div>
            </label>
          </div>

          {/* Username Display (nested) */}
          <div
            className={`ml-12 space-y-3 transition-all duration-200 ${
              !settings.showOnLeaderboards ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-600 p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">Show Username</h5>
                  <p className="text-sm text-gray-500 dark:text-gray-100">
                    Display your username publicly
                  </p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.showUsernameOnLeaderboards}
                  onChange={(e) => handleToggleUsername(e.target.checked)}
                  disabled={!settings.showOnLeaderboards}
                  className="peer sr-only"
                />
                <div
                  className={`peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white ${
                    !settings.showOnLeaderboards
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                  style={{
                    backgroundColor: settings.showUsernameOnLeaderboards
                      ? themeColor
                      : undefined,
                  }}
                ></div>
              </label>
            </div>

            {/* Preview */}
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-100 ">
                Preview on leaderboard:
              </p>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-300 px-4 py-3">
                <div className="flex items-center space-x-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-python-light text-sm font-semibold">
                    #25
                  </span>
                  <span className="font-medium">
                    {settings.showUsernameOnLeaderboards
                      ? user?.username || "YourUsername"
                      : `Learner #${user?._id?.slice(-6) || "ABC123"}`}
                  </span>
                  {!settings.showUsernameOnLeaderboards && (
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      Anonymous
                    </span>
                  )}
                </div>
                <span className="font-semibold text-yellow-600">1,400 XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`rounded-lg p-4 ${
              message.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-6 ">
          <p className="text-sm text-gray-500 px-1 dark:text-gray-100">
            Changes apply to all leaderboards immediately
          </p>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg px-6 py-2 font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: themeColor }}
            {...hoverHandlers}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
