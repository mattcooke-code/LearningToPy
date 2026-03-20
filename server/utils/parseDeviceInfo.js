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
  // Remove IPv6 prefix if present (e.g., "::ffff:192.168.1.1")
  let cleanIp = ip;
  if (ip.includes("::ffff:")) {
    cleanIp = ip.split("::ffff:")[1];
  }

  if (cleanIp.includes(".")) {
    // IPv4 - replace last octet with .0
    return cleanIp.replace(/\.\d+$/, ".0");
  }
  if (cleanIp.includes(":")) {
    // IPv6 - replace last group with :0000
    return cleanIp.replace(/:[^:]+$/, ":0000");
  }
  return null;
};

module.exports = { parseDeviceInfo, anonymiseIp };
