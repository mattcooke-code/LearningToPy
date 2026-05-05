# Utils

Utility functions, helpers, and configuration. Pure functions where possible —
no database calls, no side effects. Exceptions noted below.

## analyticsCache.js

- **Used by:** `analyticsController` (all three endpoints)
- **Responsibility:** Read-through caching with prefix-based invalidation, 5-min TTL
- **Design:** In-memory via `node-cache`. Clears on restart — not for critical data.
- **Exports:** `withCache`, `invalidatePrefix`

## AppError.js

- **Used by:** Every controller and service
- **Responsibility:** Custom error class with `statusCode`, `status` (fail/error), and `isOperational` flag
- **Design:** Extends native Error. Used by `errorHandler` middleware to distinguish operational errors from programming bugs.

## authUtils.js

- **Used by:** `authController`, `auth` middleware
- **Responsibility:** JWT generation/verification, refresh token cookie config, password reset email template
- **Design:** Thin wrappers around `jsonwebtoken`. Token secrets come from `envConfig`.
- **Exports:** `generateToken`, `verifyToken`, `clearRefreshTokenCookie`, `getRefreshTokenSettings`, `createPasswordResetEmail`, `ACCESS_TOKEN_LIFESPAN`, `REFRESH_COOKIE_OPTIONS`

## catchAsync.js

- **Used by:** Every controller
- **Responsibility:** Wraps async route handlers so rejected promises are forwarded to Express error middleware
- **Design:** One-liner higher-order function. Eliminates try/catch in controllers.

## generalUtils.js

- **Used by:** `learningEngine.js`, `gamification.js`, `streakManager.js`, `analytics.js`, `navigation.js`, `seederHelpers.js`
- **Responsibility:** String/date/ID utilities — slugify, toStringId, normalizeDate, isSameDay, getDateKey, normalizeTags, checkDate
- **Design:** All pure functions. No dependencies.

## levelUtils.js

- **Used by:** `progressController`, `adminController`
- **Responsibility:** Level calculation from completed modules (excludes M0), module order caching with 5-min TTL
- **Design:** `getModuleOrderMap` queries the database (cached). All other functions are pure calculations.
- **Exports:** `getModuleOrderMap`, `calculateLevelFromModules`, `calculateUserLevel`, `addLevelToUsers`, `getUserWithLevel`

## navigation.js

- **Used by:** `contentController`, `learningEngine.js`, `analytics.js`
- **Responsibility:** Module/lesson lookup (by ID, slug, or order), next-lesson/module resolution, caching
- **Design:** In-memory caches cleared on content changes. `getModuleIdBySlug` auto-repairs missing slugs.
- **Exports:** `getModuleById`, `getModuleIdBySlug`, `getOrderedModuleIds`, `findNextLesson`, `findNextModule`, `clearNavigationCaches`, `MODULE_SLUGS`

## parseDeviceInfo.js

- **Used by:** `adminController` (via `createAdminLog`)
- **Responsibility:** Parse device info from request headers, anonymise IP addresses for GDPR compliance
- **Design:** Prefers structured `x-devices-info` header, falls back to user-agent sniffing. IPv4/IPv6 anonymisation.
- **Exports:** `parseDeviceInfo`, `anonymiseIp`

## quizHelpers.js

- **Used by:** `contentController`, `learningEngine.js`
- **Responsibility:** Quiz state management — progress tracking, completion checks, attempt counting, XP calculation delegation
- **Design:** Pure functions that operate on user/lesson data. Mutates quiz progress objects in place.
- **Exports:** `hasQuiz`, `hasExercise`, `getOrCreateQuizProgress`, `isQuizCompleted`, `updateQuizProgress`, `getQuestionAttempts`, `calculateQuizAnswerXP`, `getQuizResultsForXP`

## responseHelpers.js

- **Used by:** Every controller
- **Responsibility:** Standardised JSON response envelope with `{ success, message, data }`
- **Design:** Attaches `debug_error` in development for non-success responses.

## seederHelpers.js

- **Used by:** Seed scripts in `/seeders`
- **Responsibility:** Normalise quiz/exercise data from JSON files into Mongoose-compatible formats
- **Design:** Handles multiple input formats. `loadLessonAsset` orchestrates file loading + formatting.
- **Exports:** `prepareQuizData`, `loadLessonAsset`

## validationHelpers.js

- **Used by:** `authController`, `contentController`, `adminController`
- **Responsibility:** Input validation — email, password, username, IP, content (XSS), session ID, XP, enums, ObjectIds, dates, string sanitisation
- **Design:** Pure validation functions returning `{ isValid, message }`. No side effects.
- **Exports:** `validateEmail`, `validatePassword`, `validateUsername`, `validateIP`, `validateContent`, `validateSessionId`, `validateXP`, `sanitizeString`, `validateEnum`, `validateObjectId`, `validateDate`
