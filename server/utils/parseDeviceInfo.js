// parseDeviceInfo.js

/**
 * Parses device info from the x-device-info header sent by AuthContext.jsx, falling back to user-agent sniffing if the header is absent or malformed
 */
const parseDeviceInfo = (headers) => {
  const base = {
    userAgent: headers["user-agent"],
    platform: "unknown",
    isMobile: /mobile/i.test(headers["user-agent"]),
  };

  try {
    const raw = headers["x-devices-info"];
    if (raw) return { ...base, ...JSON.parse(raw) };
  } catch {
    // Malformed header — return base defaults
  }
  return base;
};

// ✅ Truncate the last octet of an IPv4 address, or the last group of an IPv6
const anonymiseIp = (ip) => {
  if (!ip) return null;
  if (ip.includes(".")) return ip.replace(/\.\d+$/, ".0"); // IPv4
  if (ip.includes(":")) return ip.replace(/:[^:]+$/, ":0000"); // IPv6
  return null;
};

module.exports = { parseDeviceInfo, anonymiseIp };
