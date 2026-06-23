// AdminSettingsPanel.jsx
import { useState, useEffect, useCallback } from "react";
import { useNotification } from "../../context";
import { adminApiClient } from "../../services";
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

import {
  useAdminData,
  useAdminMutation,
  useConfirmActions,
  useSettingsManager,
} from "../../hooks";
import { AdminTabPreview } from "./AdminTabPreview";
import { SETTINGS_CONFIGS, ADMIN_TABS } from "../../constants/settingsConfigs";

/**
 * Settings panel for configuring platform-wide settings with tabbed interface.
 * Provides comprehensive settings management with real-time preview and validation.
 *
 * @component
 * @returns {JSX.Element} Settings panel with tabs and configuration options
 */

const ICON_MAP = {
  Globe,
  Palette,
  Trophy,
  Shield,
  Zap,
  Code,
};

const AdminSettingsPanel = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { showToast } = useNotification();
  const { confirmReset, confirmAction } = useConfirmActions();
  const settingsManager = useSettingsManager();

  const fetchSettings = useCallback(() => {
    return adminApiClient.get("/settings");
  }, []);

  const {
    data: fetchedSettings,
    loading,
    error,
    refetch,
  } = useAdminData(fetchSettings, [fetchSettings], {
    defaultErrorMessage: "Failed to load settings",
  });

  const saveMutation = useAdminMutation(
    async (changedSettings) => {
      return await adminApiClient.patch("/settings", {
        changes: changedSettings,
      });
    },
    {
      successAction: "save",
      successResource: "settings",
      defaultErrorMessage: "Failed to save settings",
    },
  );

  // Load fetched settings into manager
  useEffect(() => {
    if (fetchedSettings) {
      settingsManager.loadSettings(fetchedSettings);
    }
  }, [fetchedSettings]);

  const handleSave = async () => {
    if (!settingsManager.hasChanges) return;

    const validationErrors = [];
    if (settingsManager.changes.xpPerLevel <= 0) {
      validationErrors.push("XP per level must be greater than 0.");
    }
    if (settingsManager.changes.moduleXpBonus < 0) {
      validationErrors.push("Module XP bonus cannot be negative.");
    }

    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => showToast(error, "error"));
      return;
    }

    try {
      const changedSettings = settingsManager.getChangedSettings();
      await saveMutation.mutate(changedSettings);

      // Check for theme changes BEFORE resetting
      const hasThemeChanges =
        changedSettings.themeColor ||
        changedSettings.codeTheme ||
        changedSettings.defaultTheme;

      settingsManager.resetChanges();

      if (hasThemeChanges) {
        showToast(
          "Theme changes may require a page refresh to take effect",
          "info",
        );
      }
      refetch();
    } catch (err) {}
  };

  const handleReset = async () => {
    const confirmed = await confirmReset();
    if (confirmed) {
      refetch();
    }
  };

  const resetToDefaults = async () => {
    const confirmed = await confirmAction(
      "Reset All Settings",
      "Reset all settings to default values? This will affect all users.",
      "Reset to Defaults",
    );

    if (confirmed) {
      settingsManager.resetToDefaults();
      showToast("Settings reset to defaults (not yet saved).", "info");
    }
  };

  if (loading) {
    return <LoadingState message="Loading settings..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      {/* Header — stacks on small screens */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Platform Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Configure theme, gamification, and platform behavior
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
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
            disabled={!settingsManager.hasChanges || saveMutation.loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saveMutation.loading ? (
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

      {/* Tabs — pb-px keeps the blue active underline from touching the scrollbar */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto pb-5">
          {ADMIN_TABS.map((tab) => {
            const Icon = ICON_MAP[tab.icon];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-gray-300">
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
            <AdminTabPreview
              tab={activeTab}
              settings={settingsManager.settings}
            />
          </div>
        )}

        {/* Advanced Settings */}
        {activeTab === "advanced" && (
          <div className="space-y-6">
            {/* Advanced header — stacks on small screens */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
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
                className="self-start sm:self-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-gray-300">
                  {SETTINGS_CONFIGS.advanced.map((config) => {
                    const { key, ...restConfig } = config;
                    return (
                      <SettingInput
                        key={key}
                        {...restConfig}
                        value={settingsManager.settings[key]}
                        onChange={settingsManager.updateSetting}
                        isChanged={settingsManager.changes.hasOwnProperty(key)}
                      />
                    );
                  })}
                </div>

                {/* Danger Zone */}
                <div className="mt-8 pt-8 border-t border-red-200 dark:border-red-800">
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-4">
                    Danger Zone
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      {/* Danger zone row — stacks on small screens */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
                          className="self-start sm:self-auto shrink-0 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
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
