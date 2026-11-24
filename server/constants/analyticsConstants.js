// constants/analyticsConstants.js
// --- Retention ---
const WEEKS_TO_TRACK = [1, 2, 3, 4];
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

// --- Named Ranges ---
const NAMED_RANGES = ["24h", "7d", "30d", "90d", "1y", "all"];
const DEFAULT_RANGE = "30d";
const DEFAULT_GROUP_BY = "day";
const VALID_GROUP_BY = ["hour", "day", "month"];

// --- Cache ---
// TTL is enforced by analyticsCache; this controls key normalisation only.
// Ranges <= 24h bucket to the hour; everything else buckets to the day.
const CACHE_BUCKET_GRANULARITY = {
  "24h": "hour",
  "7d": "day",
  "30d": "day",
  "90d": "day",
  "1y": "day",
  all: "day",
};

// --- Device/Platform Stats ---
const DEVICE_PLATFORM_PATH = "metadata.deviceInfo.platform";

// --- User Segmentation Thresholds (avg lvl) ---
const SEGMENT_THRESHOLDS = Object.freeze({
  BEGINNER_MAX: 2,
  INTERMEDIATE_MAX: 5,
  ADVANCED_MAX: 8,
});

module.exports = {
  WEEKS_TO_TRACK,
  MS_PER_WEEK,
  NAMED_RANGES,
  DEFAULT_RANGE,
  DEFAULT_GROUP_BY,
  VALID_GROUP_BY,
  CACHE_BUCKET_GRANULARITY,
  DEVICE_PLATFORM_PATH,
  SEGMENT_THRESHOLDS,
};
