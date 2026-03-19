// /utils/deviceInfo.js
export const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  const platform = navigator.platform;

  // Detect platform
  let platformName = "unknown";
  if (platform.includes("Win")) platformName = "Windows";
  else if (platform.includes("Mac")) platformName = "macOS";
  else if (platform.includes("Linux")) platformName = "Linux";
  else if (/Android/.test(ua)) platformName = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) platformName = "iOS";

  // Detect if mobile
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);

  // Get screen size
  const screenSize = `${window.screen.width}x${window.screen.height}`;

  // Get browser
  let browser = "unknown";
  if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";

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
