import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getDeviceInfo } from "../deviceInfo";

// We need to reload the module for each test because it reads navigator
// properties at call time. jsdom lets us stub these.

beforeEach(() => {
  // Reset navigator properties to jsdom defaults before each test
  // so tests don't leak into each other.
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ============================================================================
// getDeviceInfo
// ============================================================================

describe("getDeviceInfo", () => {
  it("returns an object with all expected keys", () => {
    const info = getDeviceInfo();
    expect(info).toHaveProperty("userAgent");
    expect(info).toHaveProperty("platform");
    expect(info).toHaveProperty("browser");
    expect(info).toHaveProperty("isMobile");
    expect(info).toHaveProperty("screenSize");
    expect(info).toHaveProperty("language");
    expect(info).toHaveProperty("timezone");
  });

  // --------------------------------------------------------------------------
  // Platform detection
  // --------------------------------------------------------------------------

  it("detects Windows platform", () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      platform: "Win32",
      userAgent: "Mozilla/5.0",
    });
    expect(getDeviceInfo().platform).toBe("Windows");
  });

  it("detects macOS platform", () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      platform: "MacIntel",
      userAgent: "Mozilla/5.0",
    });
    expect(getDeviceInfo().platform).toBe("macOS");
  });

  it("detects Linux platform", () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      platform: "Linux x86_64",
      userAgent: "Mozilla/5.0",
    });
    expect(getDeviceInfo().platform).toBe("Linux");
  });

  it("detects Android platform from userAgent", () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      platform: "Linux armv7l",
      userAgent: "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36",
    });
    expect(getDeviceInfo().platform).toBe("Android");
  });

  it("detects iOS platform from userAgent (iPhone)", () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      platform: "iPhone",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    });
    expect(getDeviceInfo().platform).toBe("iOS");
  });

  it("detects iOS platform from userAgent (iPad)", () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      platform: "iPad",
      userAgent: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)",
    });
    expect(getDeviceInfo().platform).toBe("iOS");
  });

  it('returns "unknown" for unrecognised platform', () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      platform: "SomeObscureOS",
      userAgent: "Mozilla/5.0",
    });
    expect(getDeviceInfo().platform).toBe("unknown");
  });

  // --------------------------------------------------------------------------
  // Mobile detection
  // --------------------------------------------------------------------------

  it("returns isMobile: true for Android userAgent", () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      platform: "Linux armv7l",
      userAgent: "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36",
    });
    expect(getDeviceInfo().isMobile).toBe(true);
  });

  it("returns isMobile: true for iPhone userAgent", () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      platform: "iPhone",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    });
    expect(getDeviceInfo().isMobile).toBe(true);
  });

  it("returns isMobile: false for desktop Chrome on Windows", () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      platform: "Win32",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0",
    });
    expect(getDeviceInfo().isMobile).toBe(false);
  });

  // --------------------------------------------------------------------------
  // Browser detection
  // --------------------------------------------------------------------------

  it("detects Chrome", () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      platform: "Win32",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    });
    expect(getDeviceInfo().browser).toBe("Chrome");
  });

  it("detects Firefox", () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      platform: "Win32",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    });
    expect(getDeviceInfo().browser).toBe("Firefox");
  });

  it("detects Safari (and not Chrome, despite WebKit)", () => {
    // Safari UA contains "Safari" but not "Chrome"
    vi.stubGlobal("navigator", {
      ...navigator,
      platform: "MacIntel",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1.15",
    });
    expect(getDeviceInfo().browser).toBe("Safari");
  });

  it("detects Edge", () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      platform: "Win32",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    });
    expect(getDeviceInfo().browser).toBe("Edge");
  });

  it('returns "unknown" for unrecognised browser', () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      platform: "Win32",
      userAgent: "SomeCustomBrowser/1.0",
    });
    expect(getDeviceInfo().browser).toBe("unknown");
  });

  // --------------------------------------------------------------------------
  // Screen size
  // --------------------------------------------------------------------------

  it("reports the correct screen size", () => {
    vi.stubGlobal("window", {
      ...window,
      screen: { width: 1920, height: 1080 },
    });
    expect(getDeviceInfo().screenSize).toBe("1920x1080");
  });

  it("reports a different screen size for mobile viewport", () => {
    vi.stubGlobal("window", {
      ...window,
      screen: { width: 390, height: 844 },
    });
    expect(getDeviceInfo().screenSize).toBe("390x844");
  });

  // --------------------------------------------------------------------------
  // Language and timezone
  // --------------------------------------------------------------------------

  it("returns navigator.language", () => {
    // Use defineProperty to override only language, leaving platform/userAgent intact
    Object.defineProperty(navigator, "language", {
      value: "fr-FR",
      configurable: true,
    });
    expect(getDeviceInfo().language).toBe("fr-FR");
  });

  it("returns a timezone string", () => {
    const info = getDeviceInfo();
    // Timezone should be a non-empty string like "Europe/London" or "UTC"
    expect(typeof info.timezone).toBe("string");
    expect(info.timezone.length).toBeGreaterThan(0);
  });
});
