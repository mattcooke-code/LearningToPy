// adminConstants.js

/** A user counts as "active" if they engaged within this many days. */
const ACTIVE_USER_WINDOW_DAYS = 7;

/** XP awarded to a reporter when their flag is resolved as FIXED. */
const FLAG_FIX_XP_REWARD = 25;

/** Completed-module count at which a returning user is COMPLETED_PENDING. */
const LEADERBOARD_COMPLETION_THRESHOLD = 20;

const VALID_FLAG_RESOLUTIONS = ["IN_REVIEW", "FIXED", "REJECTED"];

const PRIVACY_SETTINGS = Object.freeze({
  DEFAULT: Object.freeze({
    showOnLeaderboards: true,
    showUsernameOnLeaderboards: false,
    showAsAnonymous: false,
  }),
  ADMIN: Object.freeze({
    showOnLeaderboards: false,
    showUsernameOnLeaderboards: false,
    showAsAnonymous: true,
  }),
});

/** Default / maximum page sizes per list endpoint. Tune as needed. */
const PAGE_LIMITS = Object.freeze({
  USERS: { defaultLimit: 20, maxLimit: 100 },
  FLAGS: { defaultLimit: 20, maxLimit: 100 },
  CONTENT: { defaultLimit: 1000, maxLimit: 1000 },
  LOGS: { defaultLimit: 50, maxLimit: 200 },
  ACTIVITY: { defaultLimit: 50, maxLimit: 200 },
});

/** Fields returned by `searchUsers`, and the subset it may sort by. */
const USER_LIST_FIELDS = [
  "username",
  "email",
  "level",
  "xp",
  "streak",
  "badges",
  "lastEngagementAt",
  "isBlocked",
  "isAdmin",
  "createdAt",
  "completedModulesCount",
  "ageBracket",
];
const USER_LIST_PROJECTION = Object.fromEntries(
  USER_LIST_FIELDS.map((field) => [field, 1]),
);
const SORTABLE_USER_FIELDS = [
  "username",
  "email",
  "level",
  "xp",
  "streak",
  "lastEngagementAt",
  "createdAt",
  "completedModulesCount",
];

/** Fields an admin edit must never overwrite. */
const IMMUTABLE_FIELDS = ["_id", "__v", "createdAt", "updatedAt"];

module.exports = {
  ACTIVE_USER_WINDOW_DAYS,
  FLAG_FIX_XP_REWARD,
  LEADERBOARD_COMPLETION_THRESHOLD,
  VALID_FLAG_RESOLUTIONS,
  PRIVACY_SETTINGS,
  PAGE_LIMITS,
  USER_LIST_FIELDS,
  USER_LIST_PROJECTION,
  SORTABLE_USER_FIELDS,
  IMMUTABLE_FIELDS,
};
