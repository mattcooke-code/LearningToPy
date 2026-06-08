# Frontend Code Optimisation Log

Documenting frontend performance improvements, refactoring decisions, and
bug fixes. Use this to trace issues back to specific changes.

**Date started:** 2026-06-08
**Related:** Backend schema refactor tracking document (separate file)

---

## Overview

Frontend optimisation pass focused on:

- Reducing unnecessary re-renders (memoization, state initialisation)
- Eliminating redundant API calls and allocations
- Removing the `uuid` dependency (replaced by native `crypto.randomUUID()`)
- Security: access tokens moved to memory-only (not localStorage/sessionStorage)

---

## AuthContext.jsx — Performance & Security

- **Security Fix — Token Storage:** Access tokens are now held in memory only via
  `setTokenMemory()` (module-level variable in `tokenUtils.js`). Previously stored in
  `localStorage` or `sessionStorage`, making them visible in DevTools and vulnerable to
  XSS. Only the `rememberMe` boolean preference is persisted to `localStorage` (not a
  credential). On page refresh, the httpOnly refresh token cookie is used to silently
  restore a fresh access token. Look here if users are unexpectedly logged out after
  page refresh (refresh cookie may not be sent).

- **Changed `setAuthData` — Shallow Field Comparison:** Replaced `JSON.stringify()`
  deep equality check with O(1) field comparison (`_id`, `xp`, `level`, `streak`).
  Avoids serializing the entire user object on every auth state change (login,
  register, token refresh, profile fetch). Look here if user state updates are not
  triggering re-renders when they should.

- **Changed `authContextValue` — Memoized:** Wrapped in `useMemo` to prevent all
  `useAuth()` consumers from re-rendering when unrelated context values change.
  Previously the context object was recreated on every render, causing cascading
  re-renders across the component tree. Look here if context consumers are showing
  stale data.

- **Changed `getSessionId()` — Initialised in `useState`:** Moved from inline call
  during render to `useState` initializer. Previously called on every render cycle.
  Now runs once on mount. Look here if session ID is missing or incorrect.

- **Changed `fetchUserProfile` — Removed Duplicate 401 Handler:** The Axios
  interceptor already attempts a token refresh on 401 before the error reaches the
  catch block. The duplicate `refreshAuthToken()` call in the catch was redundant.
  If the interceptor's refresh fails, authentication is fully broken — log out
  immediately. Look here if users are being logged out more aggressively than before.

- **Added `setAuthHeader(token)` Helper:** Replaced 15 lines of repeated
  `apiClient.defaults.headers.common["Authorization"] = ...` (appeared 5 times
  across the file) with a single helper function. Accepts a token string or null
  to clear headers. Look here if Authorization headers are missing on API requests.

- **Added `clearSessionId()` Call in `logout`:** Clears the in-memory session ID
  cache and removes it from localStorage. Ensures a fresh session starts on next
  login. Look here if analytics show sessions persisting across logouts.

## utils/tokenUtils.js — No Changes Needed

This file was already well-structured. Memory-only token storage was the only
significant change, implemented via `setTokenMemory()` / `getStoredAccessToken()`.
30-second buffer on `isTokenValid` is sensible for clock skew.

## services/session.js — Memory Caching & Dependency Removal

- **Changed `getSessionId()` — Memory-Cached:** Session ID is now cached in a
  module-level variable after first read from localStorage. Previously called
  `localStorage.getItem()` on every API request (20+ per page load). Now returns
  the cached value in O(1) without I/O. Look here if session IDs are not rotating
  when expected.

- **Removed `uuid` Dependency:** Replaced `uuidv4()` with native
  `crypto.randomUUID()`. Eliminates a ~3KB npm dependency. Available in all modern
  browsers (Chrome 92+, Firefox 95+, Safari 15.4+). Look here if session ID
  generation fails on older browsers.

- **Added `clearSessionId()`:** New export that clears both the memory cache and
  localStorage entry. Called by AuthContext on logout.

- **Changed `setupSessionEndTracking` — Device Info Capture:** Device info is now
  captured once at setup time, not during the `beforeunload` event. Avoids calling
  `getDeviceInfo()` during browser teardown, which is unreliable. Look here if
  session-end analytics show missing or stale device info.

## services/api.js — Request-Level Caching

- **Changed Analytics Headers — Cached Device Info:** `getDeviceInfo()` +
  `JSON.stringify()` was called on every API request. Now cached in a module-level
  variable after first call. Device info doesn't change during a session, so this
  saves ~20 allocations per page load. Look here if device info headers are stale
  or missing.

- **Removed Redundant Error Handler:** Response unwrapper's error handler
  `(err) => Promise.reject(err)` was a no-op — Axios already rejects errors.
  Simplified to single-argument `.use(unwrapResponse)`. No functional change.

- **Documented Request Interceptor:** Added comment explaining the interceptor is a
  fallback for requests made before AuthProvider finishes initializing. Default
  headers are set by `setAuthHeader()` once auth is ready.

---

## Related: Auth Bug Fixes (During This Pass)

- **`getSurroundingLeaderboard` — Missing `.toString()`:** `req.userId` was an
  ObjectId, but comparison used strict equality with a string. Added `.toString()`
  to prevent false negatives and duplicate leaderboard entries.

- **`validation.js` — Naming Conflicts:** Three functions (`validateContent`,
  `validateIP`, `validateSessionId`) imported from `validationHelpers.js` conflicted
  with same-named middleware functions after switching from `exports.fn` to `const fn`
  syntax. Aliased imports as `validateContentField`, `validateIPField`,
  `validateSessionIdField`.

---

## Bundle Size Impact

| Change                                               | Saving                                        |
| ---------------------------------------------------- | --------------------------------------------- |
| Removed `uuid` package                               | ~3KB gzipped                                  |
| Removed `jwt-decode` from tokenUtils (if applicable) | ~1.5KB gzipped                                |
| Total                                                | ~4.5KB less JavaScript to parse on first load |

---

## Files Changed

| File              | Type of Change                                                             |
| ----------------- | -------------------------------------------------------------------------- |
| `AuthContext.jsx` | Performance (memo, field comparison, helper), Security (memory-only token) |
| `tokenUtils.js`   | No changes (already well-structured)                                       |
| `session.js`      | Performance (caching), Dependency removal (`uuid`)                         |
| `api.js`          | Performance (cached device info header), Cleanup (removed no-op)           |
