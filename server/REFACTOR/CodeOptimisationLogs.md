# utils/authUtils.js (Refactored & Slimmed Down)

- **Function Removal (`createPasswordResetEmail`):** Moved to `utils/emailTemplates.js`. Look here if password reset emails fail to generate or display HTML.
- **Function Removal (`calculateAge`, `getAgeBracket`):** Moved to `utils/userUtils.js`. Look here if age calculation bugs occur.
- **Changed `clearRefreshTokenCookie()`:** Shifted from setting a 10-second dummy cookie to using Express’s native `res.clearCookie()` primitive. Look here if users cannot log out or if refresh token cookies fail to clear from the browser.
- **Removed REFRESH_COOKIE_OPTIONS:** appears to be redundant variable

# utils/emailTemplates.js (New File)

- **Added `createPasswordResetEmail()`:** Houses the HTML layout configuration. Centralizes all presentational email copy away from core authentication configurations.

# utils/userUtils.js (New File)

- **Added `calculateAge()` & `getAgeBracket()`:** Relocated from the authentication utility layer to keep demographic data logic decoupled from token operations.
- **Added `getAgeCompliancePackage()`:** Brand new orchestrator function that holds the structural JSON notices, privacy rules, and tips for different age buckets (13-15, 16-17, 18+). Look here if underage users are getting incorrect default privacy profiles, notices, or missing restrictions.

# authController.js (Optimized Core Routing)

- **Changed `register` (Parallel Query Upgrades):** Modified the database checks for duplicate registration values (`existingEmail` and `existingUsername`) to run concurrently using `Promise.all` instead of waiting sequentially. Look here if database timeouts occur during signup.
- **Changed `register` (Age Policy Delegation):** Replaced massive blocks of hardcoded text and safety notice configurations with a call to `userUtils.getAgeCompliancePackage()`. Look here if client registration responses are missing expected data fields.
- **Changed `deleteAccount` (ACID Database Transactions):** Replaced asynchronous `Promise.allSettled` queries with an atomic, unified MongoDB session transaction wrapper. If one deletion operation drops or fails, the whole chain safely rolls back. Look here if users fail to complete account erasure protocols, or if connected collections like `ActivityLog`, `FlaggedContent`, or `AdminLog` mismatch.
