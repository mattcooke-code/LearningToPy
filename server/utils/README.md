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
- **Responsibility:** JWT generation/verification, refresh token cookie configuration, and session management
- **Design:** Thin wrappers around `jsonwebtoken`. Token secrets come from `envConfig`. Cookie options adapt to environment (development vs production).

### Exports

| Export                    | Type     | Description                                                          |
| ------------------------- | -------- | -------------------------------------------------------------------- |
| `generateToken`           | Function | Sign a JWT with payload, secret, and expiration                      |
| `verifyToken`             | Function | Verify and decode a JWT, throws AppError on failure                  |
| `clearRefreshTokenCookie` | Function | Overwrite refresh token cookie with expired placeholder              |
| `getRefreshTokenSettings` | Function | Return token lifespan and cookie maxAge based on rememberMe flag     |
| `getCookieOptions`        | Function | Build environment-appropriate cookie config (httpOnly, secure, etc.) |
| `ACCESS_TOKEN_LIFESPAN`   | Constant | `"15m"`                                                              |
| `getAccessTokenSecret`    | Function | Alias for `config.getAccessTokenSecret`                              |
| `getRefreshTokenSecret`   | Function | Alias for `config.getRefreshTokenSecret`                             |

### Token Lifespan Configuration

| Mode         | Refresh Token Lifespan | Cookie Max Age             |
| ------------ | ---------------------- | -------------------------- |
| Session      | `1h`                   | 1 hour (3,600,000ms)       |
| Remember Me  | `30d`                  | 30 days (2,592,000,000ms)  |
| Access Token | `15m` (always)         | N/A (not stored in cookie) |

### Cookie Configuration

`getCookieOptions()` returns environment-appropriate settings:

| Setting       | Development | Production              |
| ------------- | ----------- | ----------------------- |
| `httpOnly`    | `true`      | `true`                  |
| `secure`      | `false`     | `true`                  |
| `sameSite`    | `"Lax"`     | `"Strict"`              |
| `path`        | `"/"`       | `"/"`                   |
| `partitioned` | _not set_   | `true` (CHIPS standard) |

The `partitioned` flag is only applied in production because it requires `secure: true`. This prevents browsers from silently dropping the refresh token cookie in development.

## catchAsync.js

- **Used by:** Every controller
- **Responsibility:** Wraps async route handlers so rejected promises are forwarded to Express error middleware
- **Design:** One-liner higher-order function. Eliminates try/catch in controllers.

## emailTemplates.js

- **Used by:** `authController` (`forgotPassword`)
- **Responsibility:** Generates standardised HTML email templates. Currently provides `createPasswordResetEmail()` which produces the password reset email with reset link, expiry notice, and security guidance.
- **Design:** Pure template function — accepts a reset URL and returns `{ subject, html }`. No side effects or external dependencies. Separated from `authUtils.js` to isolate presentation logic from authentication logic.
- **Exports:** `createPasswordResetEmail`

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

## userUtils.js

- **Used by:** `authController` (`register`)
- **Responsibility:** Age verification for GDPR and UK Children's Code (Age Appropriate Design Code) compliance
- **Design:** Three functions:
  - `calculateAge(birthDate)` — Calculates precise age from a Date object. Pure function.
  - `getAgeBracket(age)` — Maps numeric age to bracket string (`"13-15"`, `"16-17"`, `"18+"`). Pure function.
  - `getAgeCompliancePackage(age, parentalConsent)` — Returns the age bracket, default privacy settings appropriate for that bracket, and an age-specific notice with safety tips and feature restrictions. This is the primary export used during registration.
- **Privacy:** The user's date of birth is never stored. Only `ageVerified`, `ageVerifiedAt`, and `ageBracket` are persisted — sufficient for legal compliance without retaining unnecessary personal data.
- **Exports:** `calculateAge`, `getAgeBracket`, `getAgeCompliancePackage`

### Age Bracket Defaults

| Bracket | Leaderboards | Anonymous | Username Visible | Notes                                                              |
| ------- | ------------ | --------- | ---------------- | ------------------------------------------------------------------ |
| 13-15   | Off          | Yes       | No               | Requires parental consent confirmation; social features restricted |
| 16-17   | On           | No        | No               | Full control over settings; GDPR right to access/delete            |
| 18+     | On           | No        | No               | Full access to all features                                        |

## validationHelpers.js

- **Used by:** `authController`, `contentController`, `adminController`
- **Responsibility:** Input validation — email, password, username, IP, content (XSS), session ID, XP, enums, ObjectIds, dates, string sanitisation
- **Design:** Pure validation functions returning `{ isValid, message }`. No side effects.
- **Exports:** `validateEmail`, `validatePassword`, `validateUsername`, `validateIP`, `validateContent`, `validateSessionId`, `validateXP`, `sanitizeString`, `validateEnum`, `validateObjectId`, `validateDate`
