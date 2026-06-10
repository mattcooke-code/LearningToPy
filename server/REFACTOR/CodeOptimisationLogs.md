# Schema Refactor — Change Tracking Document

## Overview

Extracting unbounded arrays from `User.js` into separate collections to prevent
document bloat, improve write performance, and enable efficient pagination/TTL indexes.

**Date started:** 2026-06-05
**Production state:** Zero users — aggressive refactor, no migration scripts needed.

---

==========================================================================================

# AUTH

==========================================================================================

## utils/authUtils.js (Refactored & Slimmed Down)

- **Function Removal (`createPasswordResetEmail`):** Moved to `utils/emailTemplates.js`. Look here if password reset emails fail to generate or display HTML.
- **Function Removal (`calculateAge`, `getAgeBracket`):** Moved to `utils/userUtils.js`. Look here if age calculation bugs occur.
- **Changed `clearRefreshTokenCookie()`:** Shifted from setting a 10-second dummy cookie to using Express's native `res.clearCookie()` primitive. Look here if users cannot log out or if refresh token cookies fail to clear from the browser.
- **Removed `REFRESH_COOKIE_OPTIONS`:** Redundant constant — `getCookieOptions()` is now called dynamically where needed.

## utils/emailTemplates.js (New File)

- **Added `createPasswordResetEmail()`:** Houses the HTML layout configuration. Centralizes all presentational email copy away from core authentication configurations.

## utils/userUtils.js (New File)

- **Added `calculateAge()` & `getAgeBracket()`:** Relocated from the authentication utility layer to keep demographic data logic decoupled from token operations.
- **Added `getAgeCompliancePackage()`:** Brand new orchestrator function that holds the structural JSON notices, privacy rules, and tips for different age buckets (13-15, 16-17, 18+). Look here if underage users are getting incorrect default privacy profiles, notices, or missing restrictions.

## controllers/authController.js (Optimized Core Routing)

- **Changed `register` (Parallel Query Upgrades):** Modified the database checks for duplicate registration values (`existingEmail` and `existingUsername`) to run concurrently using `Promise.all` instead of waiting sequentially. Look here if database timeouts occur during signup.
- **Changed `register` (Age Policy Delegation):** Replaced massive blocks of hardcoded text and safety notice configurations with a call to `userUtils.getAgeCompliancePackage()`. Look here if client registration responses are missing expected data fields.
- **Changed `deleteAccount` (ACID Database Transactions):** Replaced asynchronous `Promise.allSettled` queries with an atomic, unified MongoDB session transaction wrapper. If one deletion operation drops or fails, the whole chain safely rolls back. Look here if users fail to complete account erasure protocols, or if connected collections like `ActivityLog`, `FlaggedContent`, or `AdminLog` mismatch.
- **Changed `deleteAccount` (Extended Cleanup):** Added `deleteMany` calls for new collections: `LessonCompletion`, `ModuleCompletion`, `QuizAttempt`, `XpTransaction`, `LessonQuizProgress`. Added `finally` block for guaranteed session cleanup.
- **Changed `exportUserData` (Multi-Collection Fetch):** Replaced reading embedded arrays with parallel queries to `LessonCompletion`, `ModuleCompletion`, `QuizAttempt`, `XpTransaction`, and `LessonQuizProgress` collections. Response structure updated to include all extracted data categories.
- **Fixed `register` (privacySettings Bug):** Changed `defaultPrivacySettings` (undefined variable) to use destructured `privacySettings` from `getAgeCompliancePackage()`.

## models/User.js (Complete Redesign)

- **Removed Fields:** `completedLessons[]`, `completedModules[]`, `lessonCompletionHistory[]`, `moduleCompletionHistory[]`, `quizAttempts[]`, `xpHistory[]`, `lessonQuizProgress[]`
- **Added Fields:** `completedLessonsCount` (Number), `completedModulesCount` (Number) — denormalised counters for fast reads
- **Changed `parentalConsentConfirmed`:** Default changed from `undefined` to `false`
- **Changed `stats` subdocument:** Now has explicit `default: () => ({})` to prevent `undefined` on nested fields
- **Changed disposable email validation:** Replaced `Array.some()` + `String.includes()` with `Set.has()` for O(1) exact-match lookup
- **Changed reserved username check:** Replaced array with `Set` for O(1) lookup
- **Changed `pre('save')` hook:** Narrowed `isModified` check from 5 fields to only `isNew`, `xp`, `streak`, `completedLessonsCount`, `completedModulesCount`
- **Removed Virtuals:** `badgesCount`, `completedLessonsCount`, `completedModulesCount` — replaced by stored counters or computed on demand
- **Index Strategy (12 → 7 indexes):**
  - **Removed:** `xp`, `level`, `completedLessons`, `completedModules`, `isAdmin`, `isBlocked`, `streakStatus`, `lastActive`, `createdAt`, `lastCompletionDate` (single-field indexes)
  - **Added:** `{ level: -1, xp: -1 }` (leaderboards), `{ isAdmin: 1, lastActive: -1 }` (admin listing), `{ isBlocked: 1, createdAt: -1 }` (blocked user audit)
  - **Retained:** `email` (unique), `username` (unique), `lastActiveDate`, `weeklyProgress.weekStartDate`

## models/LessonCompletion.js (New)

- Extracted from `User.lessonCompletionHistory[]` and `User.completedLessons[]`
- Fields: `userId`, `lessonId`, `completedAt`, `tags`, `contentType`, `difficulty`, `challengeGroup`, `elapsedSeconds`, `attemptNumber`, `usedHints`, `linesOfCode`, `wasOptimal`
- Indexes: `{ userId: 1, lessonId: 1 }` (unique), `{ userId: 1, completedAt: -1 }`, `{ lessonId: 1, completedAt: -1 }`

## models/ModuleCompletion.js (New)

- Extracted from `User.moduleCompletionHistory[]` and `User.completedModules[]`
- Fields: `userId`, `moduleId`, `completedAt`
- Indexes: `{ userId: 1, moduleId: 1 }` (unique), `{ userId: 1, completedAt: -1 }`, `{ userId: 1 }`

## models/QuizAttempt.js (New)

- Extracted from `User.quizAttempts[]`
- Fields: `userId`, `moduleId`, `attemptedAt`, `score`, `passed`, `answers[]` (questionId, question, userAnswer, correctAnswer, isCorrect, explanation)
- Indexes: `{ userId: 1, moduleId: 1, attemptedAt: -1 }`, `{ moduleId: 1, attemptedAt: -1 }`, `{ userId: 1, moduleId: 1, passed: 1 }`

## models/XpTransaction.js (New)

- Extracted from `User.xpHistory[]`
- Fields: `userId`, `amount`, `source` (enum), `meta` (Mixed), `awardedAt`
- Indexes: `{ userId: 1, awardedAt: -1 }`, `{ userId: 1, source: 1 }`, `{ awardedAt: 1 }` (TTL: 365 days)
- **TTL Index:** Auto-deletes transactions older than 365 days. XP total preserved on `User.xp`.

## models/LessonQuizProgress.js (New)

- Extracted from `User.lessonQuizProgress[]`
- Fields: `userId`, `lessonId`, `questionAttempts[]`, `correctAnswers[]`, `completed`, `lastAttempt`
- Indexes: `{ userId: 1, lessonId: 1 }` (unique), `{ userId: 1, completed: 1 }`

## controllers/adminController.js (7 Functions Updated)

- **Changed `searchUsers`:** Now batch-fetches `ModuleCompletion` for level calculation instead of selecting `completedModules` from User. Builds temporary completion map, passes to `addLevelToUsers()`, strips temp field before response.
- **Changed `adjustUserXp`:** Fetches `ModuleCompletion` for level calculation. Creates `XpTransaction` record for audit trail.
- **Changed `getUserDetails`:** Replaced `.populate("completedLessons")` and `.populate("completedModules")` with parallel queries to `LessonCompletion` and `ModuleCompletion`. Response now includes enriched completion data with titles and dates.
- **Changed `getUserActivity`:** Queries `LessonCompletion.find({ userId })` with sort/limit instead of slicing `user.lessonCompletionHistory` array.
- **Changed `getUserProgress`:** Queries `LessonCompletion` and `ModuleCompletion` collections instead of selecting array fields from User.
- **Changed `overrideUserProgress`:** Replaced `user.completedLessons.push()`/`.filter()` with `LessonCompletion.create()`/`deleteOne()` and `$inc` on `completedLessonsCount`. Same pattern for modules. Fetches updated counts after operation.
- **New Imports Added:** `LessonCompletion`, `ModuleCompletion`, `XpTransaction`

## controllers/progressController.js (5 Functions Updated)

- **Changed `getCurrentProgress`:** Fetches `LessonCompletion` and `ModuleCompletion` to build temporary `completedLessons`/`completedModules` arrays for the analytics service. Queries lesson completion status via new collections.
- **Changed `getAchievements`:** Fetches `LessonCompletion`, `ModuleCompletion`, and `QuizAttempt` collections. Builds enriched user object with arrays for `evaluateBadges()` and `getBadgeProgress()` compatibility.
- **Changed `getModuleLeaderboard`:** Queries `ModuleCompletion` to find users who completed the module, then filters User collection by those IDs.
- **Changed `completeLesson`:** Now expects `processLessonCompletion` to write to new collections internally. Quiz progress still read from `user.lessonQuizProgress` (needs migration).
- **Changed `completeModule`:** Writes quiz attempt to `QuizAttempt.create()` instead of `user.quizAttempts.push()`. Expects `processModuleCompletion` to write to `ModuleCompletion`.
- **New Imports Added:** `LessonCompletion`, `ModuleCompletion`, `QuizAttempt`

## services/learningEngine.js (Complete Rewrite)

- **Changed `processLessonCompletion` (Duplicate Check):** Replaced `user.completedLessons.includes()` with `LessonCompletion.findOne()`
- **Changed `processLessonCompletion` (Mark Complete):** Replaced `user.completedLessons.push()` with `LessonCompletion.create()` + `user.completedLessonsCount++`
- **Changed `processLessonCompletion` (XP History):** Replaced `user.xpHistory.push()` with `XpTransaction.insertMany()` via new `createXpTransactions()` helper
- **Changed `processLessonCompletion` (Completion Record):** Replaced `user.lessonCompletionHistory.push()` with data already written to `LessonCompletion.create()` (single write, not two)
- **Changed `processLessonCompletion` (Auto-Complete Module):** Replaced `user.completedModules.includes()` + `.push()` with `ModuleCompletion.findOne()` + `ModuleCompletion.create()` + `user.completedModulesCount++`
- **Changed `processModuleCompletion` (Duplicate Check):** Replaced `user.completedModules.includes()` with `ModuleCompletion.findOne()`
- **Changed `processModuleCompletion` (Mark Complete):** Replaced `user.completedModules.push()` + `user.moduleCompletionHistory.push()` with `ModuleCompletion.create()` + `user.completedModulesCount++`
- **Changed `processModuleCompletion` (XP History):** Replaced array push with `XpTransaction.insertMany()`
- **Changed `getCurriculumProgressStats`:** Now queries `LessonCompletion.find({ userId })` instead of reading `user.completedLessons` array
- **Added Helper `createXpTransactions()`:** Bulk-inserts XP transaction documents
- **New Imports Added:** `LessonCompletion`, `ModuleCompletion`, `XpTransaction`
- **User Document Mutations (remaining):** Only `xp`, `level`, `completedLessonsCount`, `completedModulesCount`, and `stats` are mutated on the User document. All history/completion data writes to separate collections.

## services/streakManager.js — ✅ No Changes Needed

All fields accessed remain on the User document:
`lastActiveDate`, `lastCompletionDate`, `weeklyProgress`, `streak`, `streakStatus`.
Does not read any extracted arrays.

## services/gamification.js — Updated

- **Changed `createBadgeHelpers`:** Now queries `ModuleCompletion`, `LessonCompletion`,
  and `QuizAttempt` collections instead of reading `user.completedModules`,
  `user.completedLessons`, `user.quizAttempts`, and `user.lessonCompletionHistory`.
  Returns `quizAttempts` and `lessonCompletionHistory` from fetched data for
  engagement badge checks.
- **New Imports Added:** `LessonCompletion`, `ModuleCompletion`, `QuizAttempt`
- **BADGE_LOGIC_MAP:** Unchanged — all checks use the same helper interface,
  only the data source changed from embedded arrays to collection queries.

## utils/levelUtils.js — ✅ No Changes Needed

Functions operate on whatever `completedModules` array they receive. All callers
(adminController, progressController) now build temporary arrays from
`ModuleCompletion` queries before passing to these functions. Logic unchanged.

## services/analytics.js — Updated for Multi-Collection Support

- **Changed `formatProgressResponse`:** Now accepts optional fifth parameter `completionData`
  object with pre-fetched `completedModules`, `completedLessons`, `lessonCompletions`,
  and `moduleCompletions` arrays. When provided, uses these for level calculation and
  days-active computation instead of reading from embedded user arrays. Falls back to
  `user.completedModules`/`user.completedLessons` for backward compatibility with any
  callers that haven't been updated yet.
- **Added `calculateDaysActiveFromCompletions()`:** New helper that computes unique active
  days from `LessonCompletion` and `ModuleCompletion` documents instead of embedded
  `lessonCompletionHistory` and `moduleCompletionHistory` arrays. Preferred method when
  pre-fetched data is available.
- **Changed `calculateDaysActive()`:** Retained as legacy fallback. Still reads from
  `user.lessonCompletionHistory`, `user.moduleCompletionHistory`, and `user.lastActiveDate`
  — works for callers that haven't migrated to pre-fetching.
- **Changed `getLessonCompletionCountByTag()`:** First parameter renamed from `lessonHistory`
  to `lessonCompletions`. Function body unchanged — accepts array from either old embedded
  source or new `LessonCompletion` collection.
- **Changed `hasCompletedChallengeGroup()`:** First parameter renamed from `lessonHistory`
  to `lessonCompletions`. Same backward-compatible pattern.
- **New Import Added:** `LessonCompletion`, `ModuleCompletion` (available for callers that
  pre-fetch data; not used internally by legacy paths).

## utils/quizHelpers.js — Migrated to LessonQuizProgress Collection

- **Changed `getOrCreateQuizProgress()`:** Now `async`. Signature changed from
  `(user, lessonId, lesson)` to `(userId, lessonId, lesson)`. Queries
  `LessonQuizProgress.findOne()` and creates via `LessonQuizProgress.create()`
  instead of mutating `user.lessonQuizProgress` array. No longer requires the
  full user document — only the userId string.
- **Changed `updateQuizProgress()`:** Now `async`. Persists question attempt updates
  to the database via `LessonQuizProgress.findByIdAndUpdate()` instead of mutating
  an in-memory object that relied on the caller to save. Updates `questionAttempts`,
  `lastAttempt`, and `completed` fields in a single DB call.
- **⚠️ Breaking Change — Caller Impact:** All code calling `getOrCreateQuizProgress()`
  must now `await` the result and pass `userId` (string) instead of a user object.
  This affects `contentController.js` (`submitLesson`, `getLessonContent`) and
  `learningEngine.js` (quiz XP calculation during lesson completion).
- **⚠️ `isQuizCompleted` inside `updateQuizProgress`:** Now requires the lesson's quiz
  array to determine completion. Callers may need to pass the lesson reference or
  the function may need a `totalQuestions` parameter. Review this integration point
  when deploying.
- **New Import Added:** `LessonQuizProgress`

## controllers/contentController.js — Full Multi-Collection Migration

- **Added `fetchUserCompletionData()` Helper:** New shared helper that queries
  `LessonCompletion`, `ModuleCompletion`, and `QuizAttempt` collections in parallel
  and returns `{ completedLessons, completedModules, quizAttempts }` as plain arrays
  of ID strings. Used by all read functions to replace `User.findById().select()`
  patterns. Reduces duplicate query code across 7 functions.

- **Changed `getAllModules()`:** Replaced `User.findById(userId).select("completedLessons completedModules quizAttempts")`
  with `fetchUserCompletionData(userId)`. Passes `{ quizAttempts }` object to
  `hasPassedModuleQuiz()` instead of the full user document. All progress
  calculations now use pre-fetched arrays from new collections.

- **Changed `getModule()`:** Same pattern as `getAllModules` — uses
  `fetchUserCompletionData()` for all completion lookups. Module quiz attempt
  filtering and best-score calculation now operate on the fetched `quizAttempts`
  array instead of `user.quizAttempts`.

- **Changed `getModuleLessons()`:** Replaced `User.findById().select("completedLessons")`
  with `LessonCompletion.find({ userId }).select("lessonId")`. Builds a `Set` of
  completed lesson IDs for O(1) lookup when mapping lesson completion status.

- **Changed `getLessonContent()`:** Replaced `user.completedLessons.includes(lessonId)`
  with `LessonCompletion.findOne({ userId, lessonId })` for completion check.
  Replaced `user.lessonQuizProgress.find()` with `LessonQuizProgress.findOne({ userId, lessonId })`
  for quiz progress data. Both queries are lightweight single-document lookups.

- **Changed `submitLesson()` — Quiz Progress:** Updated `getOrCreateQuizProgress()`
  call to pass `userId` instead of `user` object (matches new signature). Added
  `await` to all `updateQuizProgress()` calls since the function is now async and
  persists directly to the database. Added `await LessonQuizProgress.findByIdAndUpdate()`
  for theory/manual lesson completion to persist `completed: true`.

- **Changed `submitLesson()` — Full Completion Path:** Now fetches `LessonCompletion`
  and `ModuleCompletion` data before calling `formatProgressResponse()`, passing it
  via the new `completionData` parameter. This ensures the progress response
  includes accurate completion counts and days-active calculation from the new
  collections.

- **Changed `submitLesson()` — Partial XP Path:** Exercise and quiz partial XP
  awards unchanged — they still update `user.xp` directly on the User document
  and call `user.save()`. These are small, single-field updates that don't warrant
  separate collection writes.

- **Changed `submitModuleQuiz()` — Quiz Attempt Recording:** Replaced
  `user.quizAttempts.push(quizAttempt)` with `QuizAttempt.create({ userId, moduleId, ... })`.
  This is a standalone insert — no array mutation on the User document.

- **Changed `submitModuleQuiz()` — Module Completion Check:** Replaced
  `user.completedLessons` read with `fetchUserCompletionData()` to verify all
  lessons are done before allowing quiz submission.

- **Changed `submitModuleQuiz()` — Progress Response:** Added pre-fetched completion
  data pass-through to `formatProgressResponse()` for accurate stats in the response.

- **Changed `fixModuleProgress()`:** Replaced `user.completedModules.push()` with
  `ModuleCompletion.create()` + `user.completedModulesCount++`. Removed
  `user.moduleCompletionHistory.push()` (no longer needed — `ModuleCompletion`
  collection serves as the history). Uses `fetchUserCompletionData()` and
  `QuizAttempt.find()` for reading current state. Passes `{ quizAttempts }` to
  `hasPassedModuleQuiz()`.

- **Removed User Document Array Mutations:** The controller no longer calls
  `user.completedLessons.push()`, `user.completedModules.push()`,
  `user.quizAttempts.push()`, `user.moduleCompletionHistory.push()`, or
  `user.lessonQuizProgress.push()`. All completion data now writes to dedicated
  collections.

- **New Imports Added:** `LessonCompletion`, `ModuleCompletion`, `QuizAttempt`,
  `LessonQuizProgress`, `XpTransaction`

## controllers/analyticsController.js — Aggregation Pipeline Fixes

- **Changed `fetchContentStats()`:** Replaced `User.aggregate([{ $unwind: "$completedLessons" }, { $count: "total" }])`
  with `LessonCompletion.countDocuments()`. The `$unwind` operator was targeting the removed
  `completedLessons` array. The new approach is a simple O(1) count query on the
  `LessonCompletion` collection — significantly faster than unwinding a potentially
  large array. Look here if the admin dashboard shows 0 for "lessons completed" total.

- **Changed `fetchDemographicStats()`:** Removed `$size: "$completedLessons"` from the user
  segmentation aggregation pipeline (field no longer exists on User). Added a two-pass
  approach: first groups users by experience segment to collect user IDs, then runs
  `LessonCompletion.countDocuments({ userId: { $in: segmentUserIds } })` per segment
  to calculate `avgLessonsCompleted`. Slightly more queries but only runs for admin
  analytics (cached, infrequent). Look here if user segment stats show incorrect
  or missing `avgLessonsCompleted` values.

- **New Import Added:** `LessonCompletion`

- **Unchanged Functions:** `fetchUserStats`, `fetchActivityStats`, `fetchEngagementStats`,
  `getPlatformAnalytics`, `getContentAnalytics`, `getUserAnalytics` — these either use
  `Activity` collection exclusively or read User fields that remain on the document
  (`xp`, `level`, `username`, `lastActive`, `createdAt`).

---

## Phase 2b: Technical Debt & DS&A Review — Backend

### middleware/auth.js — JWT Verification Deduplication

- **Changed `protect` (Token Verification):** Replaced direct `jwt.verify()` call with `authUtils.verifyToken()`. Eliminates duplicate error handling logic that existed in both files. `authUtils.verifyToken` already throws `AppError` for invalid/expired tokens with proper status codes. Reduced function from 38 to 34 lines.
- **Changed `protect` (Token Extraction):** Replaced `authHeader.split(" ")[1]` with regex `authHeader.replace(/^Bearer\s+/i, "")` for case-insensitive, whitespace-tolerant token extraction per RFC 7235.
- **Changed `protect` (`req.userId`):** Set from `user._id` instead of `user.id` for consistency with codebase conventions and explicit ObjectId handling.
- **Removed Import:** `jsonwebtoken` — no longer needed; verification delegated to `authUtils`.

### middleware/validation.js — Sync Optimisation & DRY Refactor

- **Removed `catchAsync`/`async` Wrappers:** All validation functions are synchronous (no DB calls, no I/O). Removed unnecessary promise wrapper overhead from 10 functions. Each request saves micro-allocations from avoided promise creation.
- **Added `validateOrFail()` Helper:** Extracted repeated `if (!validation.isValid) { return next(new AppError(...)) }` pattern (appeared 15+ times) into a shared helper. Reduces file size ~40% and ensures consistent error formatting.
- **Fixed `validateUserLogin`:** Now accepts both `email` and `credential` fields. Previously only checked `credential`, but `authController.login` destructures `email` — middleware would reject all valid logins if applied.
- **Changed Exports:** Switched from `exports.fn = catchAsync(async ...)` to `const fn = (req, res, next) => ...` + `module.exports = { ... }`. Cleaner, no async wrapper allocation.
- **Changed `createValidator`:** Also de-async'd (factory returns sync middleware).

### middleware/sessionTracker.js — Header Mutation Fix

- **Changed Session ID Storage:** Moved from `req.headers["x-session-id"]` to `req.sessionId`. No longer mutates the request headers object (Express anti-pattern). Server now sends new session IDs back to client via `x-session-id` response header.
- **Changed Error Logging:** Improved log message format for fire-and-forget ActivityLog failures. Noted that structured logging should replace `console.error` before production scale.

### middleware/rateLimiter.js — Memory Safety & Production Readiness

- **Changed `requestTracker` Storage:** Moved from `global.requestTracker` to module-level `const requestTracker = new Map()`. Eliminates global namespace pollution and prevents state leakage in test environments.
- **Added `MAX_TRACKED_IPS` Cap (10,000):** New `evictOldestIfNeeded()` function evicts the oldest 25% of entries when the cap is reached. Prevents unbounded memory growth under DDoS with random IPs.
- **Added Cleanup for `blockedIPs`:** The 5-minute cleanup interval now also clears expired block entries (previously only cleaned `requestTracker`).
- **Changed `contentCreationLimiter`:** Bumped from 20 to 60 submissions/hour. Old limit was too restrictive — a 15-question quiz with 3 retries would exhaust it.
- **Changed `authLimiter` Key Generator:** Now also checks `req.body.credential` (in addition to `email`/`username`) for consistent rate limiting regardless of login field name.
- **Added Documentation:** Header comment now documents the single-process limitation of in-memory stores and recommends Redis for horizontal scaling.
- **Changed `hpp` Option:** `whitelist` → `allowlist` (v10+ compatible naming).

### server.js — Startup Order & Graceful Shutdown

- **Changed Server Startup:** Server now awaits database connection before listening. Previously `connectDB()` was fire-and-forget — requests arriving before the connection completed would fail. DB connection failure now calls `process.exit(1)` instead of logging "Continuing without database connection" (which was misleading — every route needs the DB).
- **Added Graceful Shutdown Handlers:** `SIGTERM` and `SIGINT` handlers close the HTTP server first, then close the MongoDB connection, then exit. Prevents in-flight request abortion on Render deploys or Ctrl+C. Includes 10-second forced exit timeout.
- **Changed `uncaughtException` Handler:** Now calls `server.close()` before `process.exit(1)` instead of immediate exit. Includes 10-second forced exit timeout. Matches the `unhandledRejection` handler pattern.
- **Changed Body Parser Limit:** Reduced from 10MB to 2MB. 10MB is a DoS vector for a JSON API; 2MB is sufficient for all current payloads. Route-specific higher limits can be applied if needed later.
- **Removed Duplicate CSP Entry:** Hardcoded `"https://learningtopy.onrender.com"` in `imgSrc` was redundant with `config.getFrontendUrl()`. Single source of truth for frontend URL.

### controllers/authController.js — Duplicate Validation Removal

- **Removed Duplicate Password Check:** `changePassword` controller no longer checks `currentPassword === newPassword`. This is now handled earlier in the middleware chain by `validatePasswordChange` middleware (fail-fast principle).

---

==========================================================================================

# CONTENT

==========================================================================================

## models/Lesson.js — Slug Optimisation & Schema Hardening

- **Changed Slug Generation — Single Query:** Replaced O(k) sequential `while (await exists(...))`
  pattern with a single `Model.find({ slug: pattern })` query + `Set` lookup. Previously
  each slug collision triggered a separate database round-trip. Now all matching slugs are
  fetched in one query and checked in-memory. Look here if duplicate slugs appear after
  creating lessons with identical titles.
- **Delegated to `generalUtils.generateUniqueSlug()`:** Slug logic extracted to shared utility
  alongside existing `slugify()`. Both `Lesson.js` and `Module.js` now use the same function.
- **Noted `quiz` array unbounded:** No `maxlength` validation on quiz questions. A seeder bug
  could create thousands of questions. Documented for future hardening.
- **Noted `codeExample` field:** Possibly unused — verify with frontend before removing.

## models/Module.js — Slug Optimisation & Redundancy Removal

- **Changed Slug Generation:** Same O(k) → O(1) fix as Lesson.js via `generalUtils.generateUniqueSlug()`.
- **Documented Pre-Save Hook Ordering:** Two separate `pre('save')` hooks (slug + order/moduleNumber)
  have implicit execution order dependency. Added comment warning that slug hook must run before
  the order hook.
- **Noted `lessonCount` Redundancy:** Both a stored `lessonCount` field and a `calculatedLessonCount`
  virtual exist. The virtual queries the Lesson collection; the field requires manual maintenance.
  Having both risks inconsistency. Documented for future cleanup.
- **Noted `prerequisites` and `learningObjectives` validation gaps:** No array length limits or
  string trimming. Documented for future hardening.

## utils/generalUtils.js — Shared Slug Generator

- **Added `generateUniqueSlug(Model, title, existingId)`:** New async function that generates a
  URL-friendly slug guaranteed unique within a Mongoose model's collection. Uses a single
  database query to fetch all existing matching slugs, then appends numeric suffixes in-memory.
  Complements the existing synchronous `slugify()` function (used by `navigation.js` for fuzzy
  matching). Look here if slug generation fails or produces unexpected results.

## controllers/contentController.js — Query Consolidation (Big O)

- **Changed `getAllModules()` — O(m) → O(1) Lesson Queries:** Previously fetched lessons
  per-module in a loop (m queries for m modules). Now fetches all lessons for all published
  modules in a single `{ moduleId: { $in: moduleIds } }` query and groups by moduleId
  client-side. For 20 modules, reduced from 20 queries to 1. Look here if module progress
  data is missing or incorrect.
- **Added `fetchLessonsByModule()` Helper:** Shared helper that fetches all published lessons
  for a set of module IDs and returns a `Map<moduleId, lessons[]>` for O(1) lookup per module.
- **Changed `getModuleLessons()` — Scoped Completion Query:** Now filters `LessonCompletion`
  by the module's lesson IDs (`{ lessonId: { $in: lessonIds } }`) instead of fetching all
  user completions. For a user with 500 completed lessons viewing a 10-lesson module, reduced
  from 500 documents scanned to 10.
- **Changed `getLessonContent()` — Parallel Queries:** `LessonCompletion` and
  `LessonQuizProgress` lookups now run via `Promise.all` instead of sequentially. Saves one
  round-trip (~5ms).
- **Changed `fetchUserCompletionData()` — Added `fullDocs` Option:** When `{ fullDocs: true }`
  is passed, returns full `LessonCompletion` and `ModuleCompletion` documents alongside the
  ID arrays. Eliminates duplicate queries in `submitLesson` and `submitModuleQuiz` where the
  same data was fetched twice (once by the helper, once directly).
- **Changed `submitLesson()` & `submitModuleQuiz()` — Reuse Completion Data:** Progress response
  construction now uses `fetchUserCompletionData(userId, { fullDocs: true })` instead of
  fetching completions separately. Eliminates 2 redundant queries per submission.
- **Changed `fixModuleProgress()` — Single Lesson Query:** Uses `fetchLessonsByModule()`
  instead of querying lessons per-module in a loop. Same O(m) → O(1) improvement as
  `getAllModules`.

## controllers/imageController.js — Startup Resolution & Path Hardening

- **Changed Base Path Resolution — Startup Instead of Per-Request:** Previously tried up to
  5 file paths sequentially via `fs.access` on every image request. Now resolves the correct
  base path once at module load time via `fsSync.existsSync`. Per-request path is a single
  `path.join`. For a page with 20 badge images, reduced from up to 100 system calls to 20.
  Look here if module images 404 after deployment (base path may need updating for new
  environments).
- **Completed `moduleFolders` Map:** Added all 21 module entries (M0–M20). Previously only
  8 modules were mapped — any unmapped module would 404.
- **Added `sendFile` Error Callback:** Handles the edge case where a file is deleted between
  `fs.access` and `res.sendFile`. Previously would throw an unhandled error.
- **Added Windows Path Traversal Protection:** Added `\\` to the security check alongside
  `..` and `/`.
- **Removed Debug Log:** Leftover `console.log` on every successful image find removed.
