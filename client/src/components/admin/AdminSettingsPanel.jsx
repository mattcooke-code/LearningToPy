// AdminSettingsPanel.jsx
import { useState, useEffect } from "react";
import { useNotification, adminApiClient } from "../../context";
import {
  Globe,
  Palette,
  Trophy,
  Shield,
  Zap,
  Code,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
} from "lucide-react";

// Components
import SettingInput from "./SettingInput";
import SaveStatusIndicator from "./SaveStatusIndicator";
import { Spinner, LoadingState, ErrorState } from "../ui";

// Hooks & Utilities
import useSettingsManager from "../../hooks/useSettingsManager";
import { renderTabSpecificContent } from "../../utils/tabContentRenderer";
import { SETTINGS_CONFIGS, ADMIN_TABS } from "../../constants/settingsConfigs";

const AdminSettingsPanel = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState(null);

  const { showConfirm } = useNotification();
  const settingsManager = useSettingsManager();

  const iconMap = {
    Globe,
    Palette,
    Trophy,
    Shield,
    Zap,
    Code,
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminApiClient.get("/settings");
      const newSettings = response.data.data || {};

      // Load settings into the manager
      settingsManager.loadSettings(newSettings);
    } catch (err) {
      setError("Failed to load settings. Please try again.");
      console.error("Settings fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settingsManager.hasChanges) return;

    try {
      setSaving(true);
      setError(null);

      // Validation
      const validationErrors = [];
      if (settingsManager.changes.xpPerLevel <= 0) {
        validationErrors.push("XP per level must be greater than 0.");
      }
      if (settingsManager.changes.moduleXpBonus < 0) {
        validationErrors.push("Module XP bonus cannot be negative.");
      }

      if (validationErrors.length > 0) {
        validationErrors.forEach((error) => showConfirm(error, "error"));
        return;
      }

      const changedSettings = settingsManager.getChangedSettings();
      await adminApiClient.patch("/settings", { changes: changedSettings });

      showConfirm("Settings saved successfully.", "success");
      settingsManager.resetChanges();

      // Notify about theme changes
      if (
        settingsManager.changes.themeColor ||
        settingsManager.changes.codeTheme ||
        settingsManager.changes.defaultTheme
      ) {
        showConfirm(
          "Theme changes may require a page refresh to take effect",
          "info"
        );
      }
    } catch (err) {
      setError("Failed to save settings. Please try again.");
      console.error("Settings save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all changes? This cannot be undone."
      )
    ) {
      fetchSettings();
    }
  };

  const resetToDefaults = () => {
    if (
      window.confirm(
        "Reset all settings to default values? This will affect all users."
      )
    ) {
      settingsManager.resetToDefaults();
      showConfirm("Settings reset to defaults (not yet saved).", "info");
    }
  };

  if (loading) {
    return <LoadingState message="Loading settings..." />;
  }

  if (error) {
    return <ErrorState error={error} onBack={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Platform Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Configure theme, gamification, and platform behavior
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {settingsManager.hasChanges && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 inline mr-2" />
              Reset Changes
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!settingsManager.hasChanges || saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <Spinner
                size="sm"
                color="white"
                showText={true}
                text="Saving..."
              />
            ) : (
              <>
                <Save className="h-4 w-4 inline mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
          {ADMIN_TABS.map((tab) => {
            const Icon = iconMap[tab.icon];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {Icon && <Icon className="h-4 w-4 inline mr-2" />}
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {/* Render settings based on active tab */}
        {activeTab !== "advanced" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SETTINGS_CONFIGS[activeTab]?.map((config) => (
                <SettingInput
                  key={config.key}
                  setting={config.key}
                  value={settingsManager.settings[config.key]}
                  onChange={settingsManager.updateSetting}
                  isChanged={settingsManager.changes.hasOwnProperty(config.key)}
                  type={config.type}
                  options={config.options}
                  label={config.label}
                  description={config.description}
                />
              ))}
            </div>

            {/* Additional tab-specific content */}
            {renderTabSpecificContent(activeTab, settingsManager.settings)}
          </div>
        )}

        {/* Advanced Settings */}
        {activeTab === "advanced" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Advanced Configuration
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  These settings affect platform behavior and should be changed
                  with caution
                </p>
              </div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {showAdvanced ? (
                  <>
                    <EyeOff className="h-4 w-4 inline mr-2" />
                    Hide Advanced
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 inline mr-2" />
                    Show Advanced
                  </>
                )}
              </button>
            </div>

            {showAdvanced && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {SETTINGS_CONFIGS.advanced.map((config) => (
                    <SettingInput
                      key={config.key}
                      {...config}
                      value={settingsManager.settings[config.key]}
                      onChange={settingsManager.updateSetting}
                      isChanged={settingsManager.changes.hasOwnProperty(
                        config.key
                      )}
                    />
                  ))}
                </div>

                {/* Danger Zone */}
                <div className="mt-8 pt-8 border-t border-red-200 dark:border-red-800">
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-4">
                    Danger Zone
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-red-800 dark:text-red-300">
                            Reset All Settings
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-400">
                            Reset all settings to default values. This will
                            affect all users immediately.
                          </p>
                        </div>
                        <button
                          onClick={resetToDefaults}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          Reset to Defaults
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <SaveStatusIndicator
        changesCount={Object.keys(settingsManager.changes).length}
      />
    </div>
  );
};

export default AdminSettingsPanel;
