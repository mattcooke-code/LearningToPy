// /client/src/hooks/useSettingsManager.js
/**
 * @fileoverview Admin settings state management hook.
 *
 * Manages a working copy of platform settings with change tracking against
 * the server-provided original. Supports loading settings from the API,
 * individual field updates, resetting to original, and resetting to platform
 * defaults.
 *
 * Used by the admin settings panel to enable dirty-state detection and
 * selective saving of only changed fields.
 *
 * @module hooks/useSettingsManager
 * @requires react
 * @requires ../utils (PLATFORM_DEFAULTS)
 */

import { useState, useCallback } from "react";
import { PLATFORM_DEFAULTS } from "../utils";

/**
 * Manage editable settings with change tracking.
 *
 * @returns {{
 *   settings: object,
 *   changes: object,
 *   updateSetting: (key: string, value: any) => void,
 *   resetChanges: () => void,
 *   loadSettings: (newSettings: object) => void,
 *   resetToDefaults: () => void,
 *   hasChanges: boolean,
 *   getChangedSettings: () => object
 * }}
 */
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

  const updateSetting = useCallback(
    (key, value) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      setChanges((prev) => {
        const newChanges = { ...prev };
        if (value === originalSettings[key]) {
          delete newChanges[key];
        } else {
          newChanges[key] = value;
        }
        return newChanges;
      });
    },
    [originalSettings],
  );

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
    getChangedSettings: () => ({ ...changes }),
  };
};
