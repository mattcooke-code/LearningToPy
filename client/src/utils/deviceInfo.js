// /client/src/utils/deviceInfo.js
/**
 * @fileoverview Device and browser detection utilities.
 *
 * Gathers information about the user's device, operating system, browser,
 * screen size, language, and timezone. Used by the analytics and session
 * services to attach context to API requests.
 *
 * @module utils/deviceInfo
 */

/**
 * Gather device, platform, browser, screen, language, and timezone info from
 * the browser environment.
 *
 * Detection order matters: Android and iOS userAgent checks run before the
 * generic Linux/Mac platform checks because mobile devices often report their
 * platform as "Linux" or "Macintosh". Similarly, Edge is checked before
 * Chrome because Edge's userAgent also contains the "Chrome" token.
 *
 * @returns {{
 *   userAgent: string,
 *   platform: string,
 *   browser: string,
 *   isMobile: boolean,
 *   screenSize: string,
 *   language: string,
 *   timezone: string
 * }}
 */
export const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  const platform = navigator.platform;

  // Detect platform — check mobile userAgents BEFORE generic platform strings
  let platformName = "unknown";
  if (/Android/.test(ua)) {
    platformName = "Android";
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    platformName = "iOS";
  } else if (platform.includes("Win")) {
    platformName = "Windows";
  } else if (platform.includes("Mac")) {
    platformName = "macOS";
  } else if (platform.includes("Linux")) {
    platformName = "Linux";
  }

  // Detect if mobile
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);

  // Get screen size
  const screenSize = `${window.screen.width}x${window.screen.height}`;

  // Get browser — Edge must be checked before Chrome (Edge UA contains "Chrome")
  let browser = "unknown";
  if (ua.includes("Edg/")) {
    browser = "Edge";
  } else if (ua.includes("Chrome")) {
    browser = "Chrome";
  } else if (ua.includes("Firefox")) {
    browser = "Firefox";
  } else if (ua.includes("Safari")) {
    browser = "Safari";
  }

  return {
    userAgent: ua,
    platform: platformName,
    browser,
    isMobile,
    screenSize,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};
