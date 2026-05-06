// /client/src/data/badges.js
/**
 * @fileoverview Badge data access layer.
 *
 * Provides the badge library and a lookup map keyed by badge ID. Sources
 * badge definitions from the shared constants package and derives
 * convenience data structures for client-side use.
 *
 * @module data/badges
 * @requires @shared/constants/badgeDefinitions.cjs
 */

import { BADGE_DEFINITIONS_CORE } from "@shared/constants/badgeDefinitions.cjs";

/**
 * The complete badge definition library.
 *
 * Mirrors `BADGE_DEFINITIONS_CORE` from the shared constants. Each badge
 * object includes an `id`, `name`, `description`, `icon`, and evaluation
 * criteria.
 *
 * @type {object[]}
 */
export const BADGE_LIBRARY = BADGE_DEFINITIONS_CORE;

/**
 * A lookup map of badge ID → badge object for O(1) access.
 *
 * Built once at module load from `BADGE_DEFINITIONS_CORE`. Useful for
 * resolving badge references in progress data, leaderboard entries, and
 * user profiles without iterating the full array.
 *
 * @type {{ [badgeId: string]: object }}
 *
 * @example
 * const badge = BADGES_BY_ID["first-lesson"];
 * console.log(badge.name); // "First Steps"
 */
export const BADGES_BY_ID = BADGE_DEFINITIONS_CORE.reduce((acc, badge) => {
  acc[badge.id] = badge;
  return acc;
}, {});
