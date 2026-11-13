// utils/parseDeviceInfo.js

/**
 * Read the client's `x-device-info` header (set by client/src/services/api.js).
 *
 * The client URL-encodes the JSON so header values stay plain ASCII. Older
 * clients sent raw JSON, so fall back to that during rollout.
 *
 * @returns {Object|null}
 */
const readDeviceHeader = (headers) => {
  const raw = headers["x-device-info"];
  if (typeof raw !== "string" || !raw) return null;

  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    /* not URL-encoded — try raw JSON */
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const cap = (value, max) =>
  typeof value === "string" && value ? value.slice(0, max) : undefined;

/**
 * Parse device information from request headers.
 *
 * The `user-agent` header is authoritative for `userAgent`. Everything else is
 * client-reported, so only known fields are kept, with types checked and
 * lengths capped. Fields that are absent are omitted (never `undefined`),
 * so the result is safe to use inside Mongo update operators.
 *
 * @param   {Object} headers - Express request headers
 * @returns {{ userAgent: string, platform: string, isMobile: boolean,
 *             browser?: string, screenSize?: string,
 *             language?: string, timezone?: string }}
 */
const parseDeviceInfo = (headers) => {
  const userAgent =
    typeof headers["user-agent"] === "string" ? headers["user-agent"] : "";
  const reported = readDeviceHeader(headers);
  const fromClient = reported && typeof reported === "object" ? reported : {};

  const result = {
    userAgent: userAgent.slice(0, 500),
    platform: cap(fromClient.platform, 50) ?? "unknown",
    isMobile:
      typeof fromClient.isMobile === "boolean"
        ? fromClient.isMobile
        : /mobile/i.test(userAgent),
    browser: cap(fromClient.browser, 50),
    screenSize: cap(fromClient.screenSize, 20),
    language: cap(fromClient.language, 35),
    timezone: cap(fromClient.timezone, 64),
  };

  return Object.fromEntries(
    Object.entries(result).filter(([, value]) => value !== undefined),
  );
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
