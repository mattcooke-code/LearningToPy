// badges.js

import { BADGE_DEFINITIONS_CORE } from "../../../shared/constants/badgeDefinitions";

export const BADGE_LIBRARY = BADGE_DEFINITIONS_CORE;
export const BADGES_BY_ID = BADGE_DEFINITIONS_CORE.reduce((acc, badge) => {
  acc[badge.id] = badge;
  return acc;
}, {});
