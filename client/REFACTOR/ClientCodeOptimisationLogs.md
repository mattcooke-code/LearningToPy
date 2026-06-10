# Frontend Code Optimisation Log

Documenting frontend performance improvements, refactoring decisions, and
bug fixes taking into account technical debt and data structures and algorithms
(Big O Notation). Use this to trace issues back to specific changes.

**Date started:** 2026-06-08
**Related:** Backend schema refactor tracking document (separate file)

---

## Overview

Frontend optimisation pass focused on:

- Reducing unnecessary re-renders (memoization, state initialisation)
- Eliminating redundant API calls and allocations
- Removing the `uuid` dependency (replaced by native `crypto.randomUUID()`)
- Security: access tokens moved to memory-only (not localStorage/sessionStorage)
- Fixing dynamic Tailwind classes (broken in production builds)
- Preventing flash-of-login-form for already-authenticated users
- Replacing JavaScript hover handlers with CSS custom properties + Tailwind `hover:`

---

## context/AuthContext.jsx — Performance & Security

- **Security Fix — Token Storage:** Access tokens are now held in memory only via
  `setTokenMemory()` (module-level variable in `tokenUtils.js`). Previously stored in
  `localStorage` or `sessionStorage`, making them visible in DevTools and vulnerable to
  XSS. Only the `rememberMe` boolean preference is persisted to `localStorage` (not a
  credential). On page refresh, the httpOnly refresh token cookie is used to silently
  restore a fresh access token. Look here if users are unexpectedly logged out after
  page refresh (refresh cookie may not be sent).

- **Changed `setAuthData` — Shallow Field Comparison:** Replaced `JSON.stringify()`
  deep equality check (O(n) serialization) with O(1) field comparison (`_id`, `xp`,
  `level`, `streak`). Avoids serializing the entire user object on every auth state
  change (login, register, token refresh, profile fetch). Look here if user state
  updates are not triggering re-renders when they should.

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

## context/ThemeContext.jsx — CSS Custom Properties for Theme Colours

- **Added CSS Variable Effect:** New `useEffect` sets `--theme-color` and
  `--theme-hover-color` on `document.documentElement` whenever `themeColor` changes.
  Enables Tailwind classes like `bg-theme` / `hover:bg-theme-hover` to work without
  JavaScript hover handlers. Look here if theme colours are not applying to elements
  using `bg-theme`.
- **Added Cleanup in `resetTheme` and `setDefaultTheme`:** CSS custom properties
  are removed on theme reset to prevent stale colour values.

## context/NotificationContext.jsx — Dependency Removal & Timer Cleanup

- **Removed `uuid` Dependency:** Replaced `uuidv4()` with `crypto.randomUUID()` —
  the last remaining `uuid` import in the project. Package can now be uninstalled.
- **Fixed Timer Memory Leak:** `removeToast` now clears the auto-dismiss `setTimeout`
  via a `timersRef` Map. Previously, manually dismissing a toast left a pending
  timeout that would call `setToasts` unnecessarily. Pending timers on unmount are
  also tracked.

## hooks/useThemeStyles.js — Replaced by CSS Approach

- **Removed JavaScript Hover Handlers:** The `hoverHandlers` object (which used
  `onMouseEnter`/`onMouseLeave` to set `style.backgroundColor`) has been replaced
  by CSS custom properties + Tailwind `hover:bg-theme-hover`. Components using
  `useThemeStyles` should now use `bg-theme hover:bg-theme-hover transition-colors`
  instead. The hook still exports `themeColor` for components that need the raw value.

## index.css — Tailwind v4 Theme Configuration

- **Added `--color-theme` and `--color-theme-hover` to `@theme`:** These CSS
  variables bridge JavaScript-driven theme colours (`--theme-color` set by
  ThemeContext) to Tailwind utility classes (`bg-theme`, `hover:bg-theme-hover`).
  Required because Tailwind v4 uses CSS-based `@theme` configuration — the
  `tailwind.config.js` file is ignored in v4.

---

## components/layout/ProtectedRoute.jsx — Redirect State & Unused Import

- **Changed Redirect — Preserves Intended Destination:** Now passes
  `state={{ from: location.pathname }}` to the `/login` redirect so the login page
  can send the user back to their intended page after authentication.
- **Removed Unused `useLocation` Import:** Now used for the redirect state above.
  Previously imported but never called.

## components/layout/AdminGuard.jsx — Redirect Target & Dead Code

- **Changed Default Redirect:** Changed from `redirectTo="/"` to
  `redirectTo="/dashboard"`. Non-admin users are now sent to their dashboard rather
  than the public landing page (where an "admin blocked" message would be confusing).
- **Removed Dead `if (showToast)` Guard:** `showToast` is always defined from
  `useNotification()`. The condition was always truthy — dead code.
- **Removed Unused `useNotification` Import:** No longer needed after removing the
  dead guard.

## pages/Home.jsx — Scroll Listener Optimisation

- **Changed Scroll Listener — Guarded State Updates:** Added `pinned` variable to
  track current state and skip `setIsPinned()` calls when the value hasn't changed.
  Previously called `setIsPinned(true)` on every scroll frame past 80px (~60 calls/sec).
  Now only calls on transition. Also added `{ passive: true }` for better scroll
  performance.
- **Changed `useEffect` — Split Concerns:** Separated the theme initialisation effect
  from the scroll listener effect. Previously both were in a single effect with
  `setDefaultTheme` as a dependency, causing the scroll listener to re-register if
  the theme function reference changed.

## pages/Login.jsx — Auth Check & Redirect Optimisation

- **Changed Auth Check — Prevents Form Flash:** Added loading spinner during initial
  authentication check (`loading && !isAuthenticated`). Previously the login form
  rendered briefly before the redirect fired for already-authenticated users. Also
  returns `null` when authenticated to prevent any form render.
- **Changed Redirect — Added `replace: true`:** Prevents the login page from
  appearing in browser history. Without this, pressing Back after login returns to
  the login page which immediately redirects again (annoying loop).
- **Added Double-Submit Guard:** `if (loading) return` in `handleSubmit` prevents
  duplicate requests on rapid double-click or double-Enter.
- **Changed Loading State — Uses `LoadingState` Component:** Replaced manual
  `Spinner` + container div with the standardised `LoadingState` component for
  consistency with the rest of the app.

## pages/Register.jsx — Dynamic Tailwind Fix & Static Data Extraction

- **Fixed Dynamic Tailwind Classes — Production Build Safety:** Replaced
  ``bg-`${ageInfo.color}`-50`` pattern with complete class strings via `AGE_COLORS`
  map. Dynamic class names are not detected by Tailwind's build-time scanner and
  would silently fail in production with purged CSS. Look here if age bracket info
  panels have no background color in production.
- **Extracted `AGE_INFO_MAP` and `AGE_COLORS` to Module Scope:** Previously defined
  inside the component via `getAgeInfo()` function, recreating objects on every render.
  Now static constants outside the component. O(1) lookup instead of switch statement
  on every keystroke.
- **Extracted `MAX_DATE_OF_BIRTH` to Module Scope:** Previously an IIFE inside the
  component that recalculated on every render. Value only changes once per day.
  Now computed once on module load.
- **Changed Redirect — Same Fixes as Login.jsx:** Added `LoadingState` during auth
  check, `replace: true` on navigate, `if (loading) return` guard.
- **Added Comment — Duplicate Age Logic:** Documented that `getAgeBracket` mirrors
  `server/utils/userUtils.js` and is for client-side preview only. Server validates
  independently.

## pages/ForgotPasswordPage.jsx — Dead Code Removal

- **Removed `useAuth` Import and `authError` Display Block:** `authError` is set
  during login/register actions, never during password reset. The display block was
  dead code that would never render.
- **Added Double-Submit Guard:** `if (loading) return` in `handleSubmit`.

## pages/ResetPasswordPage.jsx — Effect Cleanup & Validation Simplification

- **Added Cleanup Flag to `useEffect`:** `cancelled` variable prevents state updates
  after component unmount (user navigates away during token validation API call).
  Previously could set state on unmounted component.
- **Removed `showToast` from Effect Dependencies:** Changed dependency array to `[]`
  (runs once on mount — token from URL params won't change). Previously `showToast`
  in deps could cause re-validation if NotificationContext re-rendered.
- **Removed Redundant Toast on Valid Token:** The form appearing is confirmation
  enough. Previously showed a toast on every page load/refresh.
- **Removed Weak Frontend Password Validation:** Removed `password.length < 6` check.
  The backend enforces stronger requirements (uppercase, lowercase, number, special
  char). Frontend check was misleading — a password could pass frontend but fail
  backend. The `minLength={6}` attribute on the input provides a hint; server
  validation provides the authoritative error.
- **Added Double-Submit Guard:** `if (loading) return` in `handleSubmit`.

## pages/Profile.jsx — Nested Ternary Simplification

- **Changed Account Section Rendering:** Replaced triple nested ternary
  (`section === "password" ? ... : section === "export" ? ... : section === "delete" ? ...`)
  with a single conditional + `<AccountManagement section={activeAccountSection}>`.
  Eliminates O(n) conditional chain and makes adding new sections trivial.

## components/settings/AccountManagement.jsx — ✅ No Changes Needed

Pure routing component — renders one of three sub-components based on prop.
No state, no effects, no loops. O(1).

## components/settings/CookieNotice.jsx — Double Render Fix

- **Changed Visibility State — Lazy Initializer:** Replaced `useState(false)` +
  `useEffect` pattern with `useState(() => !localStorage.getItem(...))`. Previously
  rendered `null` on first pass, then the effect fired and triggered a second render.
  Now resolves correctly on the initial render.

## components/settings/ChangePassword.jsx — Double-Submit Guard

- **Added Double-Submit Guard:** `if (loading) return` in `handleSubmit`.

## components/settings/DeleteAccount.jsx — Navigation & Guards

- **Changed Cancel Navigation:** Replaced `navigate(-1)` with `onBack?.()` prop
  (passed from `AccountManagement`). Prevents leaving the app if the user navigated
  directly to the delete section with no browser history.
- **Changed Success Navigation:** Replaced `navigate("/account-deleted")` with
  `navigate("/login", { replace: true })`. Explicit destination rather than relying
  on a page that may not exist.
- **Added Double-Submit Guard:** `if (loading) return` in `handleDelete`.
- **Added Comment — Intentional `setLoading` Skip:** Documented why `setLoading(false)`
  is only called in the catch block (success path unmounts the component).

## components/settings/ExportData.jsx — Download Simplification

- **Removed Unnecessary DOM Operations:** Removed `document.body.appendChild(link)`
  and `document.body.removeChild(link)` from the download flow. Modern browsers
  support clicking detached elements — the DOM insertion was only needed for
  Firefox < 75.
- **Added Double-Click Guard:** `if (loading) return` in `handleExport`.

## components/settings/PrivacySettings.jsx — Props-to-State Sync Fix

- **Removed `useEffect` Props Sync:** Replaced `useState(defaults)` + `useEffect`
  (which synced `user.privacySettings` into local state on every `user` change)
  with `useState(() => user?.privacySettings ?? defaults)`. Eliminates double
  render on user prop changes and prevents local state from being overwritten by
  parent re-renders.
- **Fixed `setTimeout` Without Cleanup:** Added `timerRef` to clear the success
  message timeout if the component unmounts before 3 seconds.

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

| Change                 | Saving                                      |
| ---------------------- | ------------------------------------------- |
| Removed `uuid` package | ~3KB gzipped                                |
| Total                  | ~3KB less JavaScript to parse on first load |

---

## Files Changed

| File                                        | Type of Change                                                             |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| `context/AuthContext.jsx`                   | Performance (memo, field comparison, helper), Security (memory-only token) |
| `context/ThemeContext.jsx`                  | CSS custom properties for theme colours                                    |
| `context/NotificationContext.jsx`           | Dependency removal (`uuid`), timer cleanup                                 |
| `hooks/useThemeStyles.js`                   | Replaced by CSS approach (kept for `themeColor` export)                    |
| `index.css`                                 | Tailwind v4 `@theme` entries for `bg-theme` / `hover:bg-theme-hover`       |
| `utils/tokenUtils.js`                       | No changes (already well-structured)                                       |
| `services/session.js`                       | Performance (caching), Dependency removal (`uuid`)                         |
| `services/api.js`                           | Performance (cached device info header), Cleanup (removed no-op)           |
| `components/layout/ProtectedRoute.jsx`      | Redirect state preservation                                                |
| `components/layout/AdminGuard.jsx`          | Redirect target, dead code removal                                         |
| `components/settings/AccountManagement.jsx` | No changes needed                                                          |
| `components/settings/CookieNotice.jsx`      | Double render fix                                                          |
| `components/settings/ChangePassword.jsx`    | Double-submit guard                                                        |
| `components/settings/DeleteAccount.jsx`     | Navigation fix, double-submit guard                                        |
| `components/settings/ExportData.jsx`        | Download simplification, double-click guard                                |
| `components/settings/PrivacySettings.jsx`   | Props sync fix, timer cleanup                                              |
| `pages/Home.jsx`                            | Scroll listener optimisation, effect separation                            |
| `pages/Login.jsx`                           | Auth check flash prevention, redirect replace, double-submit guard         |
| `pages/Register.jsx`                        | Dynamic Tailwind fix, static data extraction, auth check fixes             |
| `pages/ForgotPasswordPage.jsx`              | Dead code removal, double-submit guard                                     |
| `pages/ResetPasswordPage.jsx`               | Effect cleanup, validation simplification, double-submit guard             |
| `pages/Profile.jsx`                         | Nested ternary simplification                                              |
