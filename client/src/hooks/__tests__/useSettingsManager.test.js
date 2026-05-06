import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSettingsManager } from "../useSettingsManager";
import { PLATFORM_DEFAULTS } from "../../utils";

describe("useSettingsManager", () => {
  // ---- Initial state ----
  it("initialises settings and originalSettings to PLATFORM_DEFAULTS", () => {
    const { result } = renderHook(() => useSettingsManager());

    expect(result.current.settings).toEqual(PLATFORM_DEFAULTS);
    expect(result.current.hasChanges).toBe(false);
    expect(result.current.getChangedSettings()).toEqual({});
  });

  // ---- updateSetting ----
  it("updateSetting changes a single setting value", () => {
    const { result } = renderHook(() => useSettingsManager());

    act(() => {
      result.current.updateSetting("themeColor", "#ff0000");
    });

    expect(result.current.settings.themeColor).toBe("#ff0000");
    expect(result.current.hasChanges).toBe(true);
    expect(result.current.getChangedSettings()).toEqual({
      themeColor: "#ff0000",
    });
  });

  it("updateSetting tracks multiple changes", () => {
    const { result } = renderHook(() => useSettingsManager());

    act(() => {
      result.current.updateSetting("themeColor", "#ff0000");
      result.current.updateSetting("maxFileSize", 20);
    });

    expect(result.current.settings.themeColor).toBe("#ff0000");
    expect(result.current.settings.maxFileSize).toBe(20);
    expect(result.current.hasChanges).toBe(true);
    expect(result.current.getChangedSettings()).toEqual({
      themeColor: "#ff0000",
      maxFileSize: 20,
    });
  });

  // ---- Reverting changes ----
  it("removes a setting from changes when reverted to original", () => {
    const { result } = renderHook(() => useSettingsManager());

    // Change it
    act(() => {
      result.current.updateSetting("themeColor", "#ff0000");
    });
    expect(result.current.hasChanges).toBe(true);
    expect(result.current.getChangedSettings()).toHaveProperty("themeColor");

    // Revert it back
    act(() => {
      result.current.updateSetting("themeColor", PLATFORM_DEFAULTS.themeColor);
    });

    expect(result.current.settings.themeColor).toBe(
      PLATFORM_DEFAULTS.themeColor,
    );
    expect(result.current.hasChanges).toBe(false);
    expect(result.current.getChangedSettings()).toEqual({});
  });

  // ---- resetChanges ----
  it("resetChanges reverts all settings to originals", () => {
    const { result } = renderHook(() => useSettingsManager());

    act(() => {
      result.current.updateSetting("themeColor", "#ff0000");
      result.current.updateSetting("maxFileSize", 20);
    });

    act(() => {
      result.current.resetChanges();
    });

    expect(result.current.settings).toEqual(result.current.settings);
    expect(result.current.hasChanges).toBe(false);
    expect(result.current.getChangedSettings()).toEqual({});
  });

  // ---- loadSettings ----
  it("loadSettings overwrites settings and clears changes", () => {
    const { result } = renderHook(() => useSettingsManager());

    // Make a change first
    act(() => {
      result.current.updateSetting("themeColor", "#ff0000");
    });

    const serverSettings = {
      ...PLATFORM_DEFAULTS,
      themeColor: "#00ff00",
      maxFileSize: 15,
    };

    act(() => {
      result.current.loadSettings(serverSettings);
    });

    expect(result.current.settings.themeColor).toBe("#00ff00");
    expect(result.current.settings.maxFileSize).toBe(15);
    // Other fields should be defaults
    expect(result.current.settings.sessionTimeout).toBe(
      PLATFORM_DEFAULTS.sessionTimeout,
    );
    expect(result.current.hasChanges).toBe(false);
    expect(result.current.getChangedSettings()).toEqual({});
  });

  it("loadSettings fills missing fields with defaults", () => {
    const { result } = renderHook(() => useSettingsManager());

    const partialSettings = {
      themeColor: "#abc123",
    };

    act(() => {
      result.current.loadSettings(partialSettings);
    });

    expect(result.current.settings.themeColor).toBe("#abc123");
    expect(result.current.settings.maxFileSize).toBe(
      PLATFORM_DEFAULTS.maxFileSize,
    );
    expect(result.current.settings.sessionTimeout).toBe(
      PLATFORM_DEFAULTS.sessionTimeout,
    );
  });

  // ---- resetToDefaults ----
  it("resetToDefaults sets settings to PLATFORM_DEFAULTS and tracks diffs", () => {
    const { result } = renderHook(() => useSettingsManager());

    // First load custom settings as the "original" (from server)
    const serverSettings = {
      ...PLATFORM_DEFAULTS,
      themeColor: "#00ff00",
      maxFileSize: 20,
      enableComments: false,
    };

    act(() => {
      result.current.loadSettings(serverSettings);
    });

    // Now reset to factory defaults
    act(() => {
      result.current.resetToDefaults();
    });

    // Settings should now be PLATFORM_DEFAULTS
    expect(result.current.settings.themeColor).toBe(
      PLATFORM_DEFAULTS.themeColor,
    );
    expect(result.current.settings.maxFileSize).toBe(
      PLATFORM_DEFAULTS.maxFileSize,
    );

    // hasChanges should be true (defaults differ from original server settings)
    expect(result.current.hasChanges).toBe(true);

    // getChangedSettings should contain the differing fields
    const changes = result.current.getChangedSettings();
    expect(changes.themeColor).toBe(PLATFORM_DEFAULTS.themeColor);
    expect(changes.maxFileSize).toBe(PLATFORM_DEFAULTS.maxFileSize);
    expect(changes.enableComments).toBe(true);
  });

  it("resetToDefaults has no changes when server already matches defaults", () => {
    const { result } = renderHook(() => useSettingsManager());

    act(() => {
      result.current.loadSettings(PLATFORM_DEFAULTS);
      result.current.resetToDefaults();
    });

    // Nothing changed
    expect(result.current.hasChanges).toBe(false);
    expect(result.current.getChangedSettings()).toEqual({});
  });

  // ---- Edge cases ----
  it("handles boolean values correctly", () => {
    const { result } = renderHook(() => useSettingsManager());

    act(() => {
      result.current.updateSetting("enableLeaderboards", false);
    });

    expect(result.current.settings.enableLeaderboards).toBe(false);
    expect(result.current.hasChanges).toBe(true);

    // Revert
    act(() => {
      result.current.updateSetting("enableLeaderboards", true);
    });

    expect(result.current.hasChanges).toBe(false);
  });

  it("handles numeric values correctly", () => {
    const { result } = renderHook(() => useSettingsManager());

    act(() => {
      result.current.updateSetting("sessionTimeout", 120);
    });

    expect(result.current.settings.sessionTimeout).toBe(120);

    act(() => {
      result.current.updateSetting("sessionTimeout", 0);
    });

    expect(result.current.settings.sessionTimeout).toBe(0);
  });
});
