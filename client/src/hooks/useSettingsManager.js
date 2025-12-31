// useSettingsManager.js
import { useState, useCallback } from "react";
import { PLATFORM_DEFAULTS } from "../utils";

export const useSettingsManager = () => {
  // The "Source of Truth" from the database
  const [originalSettings, setOriginalSettings] = useState({
    ...PLATFORM_DEFAULTS,
  });
  // What the user is currently seeing/editing
  const [settings, setSettings] = useState({ ...PLATFORM_DEFAULTS });
  const [changes, setChanges] = useState({});

  const loadSettings = useCallback((newSettings) => {
    const cleanSettings = { ...PLATFORM_DEFAULTS, ...newSettings };
    setOriginalSettings(cleanSettings);
    setSettings(cleanSettings);
    setChanges({});
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));

    setChanges((prev) => {
      const newChanges = { ...prev };
      // If the new value is the same as the original server value,
      // remove it from the changes object!
      if (value === originalSettings[key]) {
        delete newChanges[key];
      } else {
        newChanges[key] = value;
      }
      return newChanges;
    });
  };

  const resetChanges = () => {
    setSettings(originalSettings);
    setChanges({});
  };

  const resetToDefaults = () => {
    setSettings({ ...PLATFORM_DEFAULTS });
    // Calculate which defaults actually differ from current original settings
    const defaultChanges = {};
    Object.keys(PLATFORM_DEFAULTS).forEach((key) => {
      if (PLATFORM_DEFAULTS[key] !== originalSettings[key]) {
        defaultChanges[key] = PLATFORM_DEFAULTS[key];
      }
    });
    setChanges(defaultChanges);
  };

  return {
    settings,
    changes,
    updateSetting,
    resetChanges,
    loadSettings,
    resetToDefaults,
    hasChanges: Object.keys(changes).length > 0,
    getChangedSettings: () => changes,
  };
};
