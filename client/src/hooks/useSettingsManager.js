// useSettingsManager.js
import { useState } from "react";
import { PLATFORM_DEFAULTS } from "../utils/platformDefaults";

const useSettingsManager = () => {
  const [settings, setSettings] = useState({ ...PLATFORM_DEFAULTS });
  const [changes, setChanges] = useState({});

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setChanges((prev) => ({ ...prev, [key]: value }));
  };

  const resetChanges = () => {
    setChanges({});
  };

  const getChangedSettings = () => {
    return Object.keys(changes).reduce((acc, key) => {
      acc[key] = settings[key];
      return acc;
    }, {});
  };

  const loadSettings = (newSettings) => {
    setSettings(newSettings);
    resetChanges();
  };

  const resetToDefaults = () => {
    setSettings({ ...PLATFORM_DEFAULTS });
    setChanges(PLATFORM_DEFAULTS);
  };

  return {
    settings,
    changes,
    updateSetting,
    resetChanges,
    getChangedSettings,
    loadSettings,
    resetToDefaults,
    hasChanges: Object.keys(changes).length > 0,
  };
};

export default useSettingsManager;
