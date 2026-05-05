// parseDeviceInfo.js

/**
 * Parse device information from request headers.
 *
 * Prefers the structured `x-devices-info` header (set by the frontend's AuthContext).
 * Falls back to user-agent sniffing for mobile detection if the header is absent
 * or contains malformed JSON.
 *
 * @param   {Object} headers - Express request headers
 * @returns {Object} { userAgent, platform, isMobile, ...parsedHeaderFields }
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

/**
 * Anonymise an IP address for GDPR-compliant logging.
 *
 * IPv4: Replaces the last octet with .0 (e.g., 192.168.1.42 → 192.168.1.0)
 * IPv6: Replaces the last group with :0000
 * Handles IPv4-mapped IPv6 addresses (::ffff: prefix).
 *
 * @param   {string} ip - Raw IP address
 * @returns {string|null} Anonymised IP or null
 */
const anonymiseIp = (ip) => {
  if (!ip) return null;
  let cleanIp = ip;
  if (ip.includes("::ffff:")) {
    cleanIp = ip.split("::ffff:")[1];
  }

  if (cleanIp.includes(".")) {
    return cleanIp.replace(/\.\d+$/, ".0");
  }
  if (cleanIp.includes(":")) {
    return cleanIp.replace(/:[^:]+$/, ":0000");
  }
  return null;
};

module.exports = { parseDeviceInfo, anonymiseIp };
