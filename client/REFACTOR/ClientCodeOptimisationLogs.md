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

==========================================================================================

# AUTH

==========================================================================================

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

==========================================================================================

# CONTENT

==========================================================================================

## pages/ModulesPage.jsx — Parallel Data Fetching

- **Changed Data Fetching — Sequential → Parallel:** Replaced two sequential `apiClient.get()` calls
  (modules + progress) with `Promise.allSettled`. Previously modules rendered first without
  progress data, then updated when progress arrived — causing a layout shift. Now both resolve
  together with partial-failure tolerance (modules can display even if progress fetch fails).
  Look here if modules page shows loading indefinitely or progress data is missing.
- **Removed Redundant `setLoading(true)`:** Initial state already starts as `true` — the first
  `setLoading(true)` in the fetch function was a no-op.

## pages/ModuleLessonsPage.jsx — Effect Dependency Narrowing

- **Changed `useEffect` Dependencies — `[moduleId]` Only:** Previously depended on
  `[moduleId, isAuthenticated, authLoading, navigate]`. Auth state changes (e.g., token
  refresh) would re-trigger the lesson fetch unnecessarily. Now only refetches when
  navigating to a different module. Auth guard still handled by early return.
  Look here if lessons don't load after login or token refresh.

## components/module/ModuleCard.jsx — ✅ No Changes Needed

Clean display component. Dynamic accent color via inline style — correct for per-module
progress-based theming. No state, no effects, no loops.

## components/module/ModulesGrid.jsx — ✅ No Changes Needed

Simple grid with empty state. `Array.isArray` guard is defensive and correct.

## components/module/ModulesHeader.jsx — ✅ No Changes Needed

Progress bar with dynamic theme color. Delegates to `calculateModulesCompletionProgress`
utility which safely handles `totalModules === 0`.

## components/module/ModulesStats.jsx — ✅ No Changes Needed

Pure display — three stat cards. Zero logic.

## components/module_lesson/LessonItem.jsx — ✅ No Changes Needed

Responsive lesson row with dynamic accent color. Clean conditional rendering for
locked/completed/available states.

## components/module_lesson/LessonsList.jsx — ✅ No Changes Needed

Container with empty state fallback. `lesson._id` as key — stable and unique.

## components/module_lesson/ModuleHeader.jsx — ✅ No Changes Needed

Delegates to `ProgressCircle` for circular progress. Back navigation and progress bar
use dynamic accent color correctly.

## components/module_lesson/ProgressCircle.jsx — Constant Extraction

- **Moved `circumference` to Module Scope:** `2 * Math.PI * 36` (~226.2) is a constant
  — previously recalculated on every render. Now `CIRCUMFERENCE` at module level.
- **Noted Location:** Should be in `/components/ui/` — reusable, not module-specific.
  Currently only used by `ModuleHeader`.

## components/module_lesson/QuickActions.jsx — Constant Extraction

- **Extracted `BASE_BTN_CLASS` and `NEUTRAL_BTN_CLASS` to Module Scope:** Long Tailwind
  class strings were recreated on every render. Now static constants.
- **Four-State Conditional:** Module mastered, course complete, quiz ready, standard
  continue — handled with clear early returns. Readable and maintainable.

## pages/LessonPage.jsx — Previously Optimised (Triple Toast Fix)

- **Added `isCompletingRef` Guard:** Prevents concurrent completion requests.
- **Added `newlyCompleted` Check:** Silently ignores duplicate completion responses.
- **Fixed `handleQuizComplete`:** Removed redundant `markLessonComplete()` call — quiz
  submission response drives completion directly.
- **Fixed `useEffect` for Theory Lessons:** Excluded `contentType === "THEORY"` from
  the `exerciseCompleted && quizCompleted` trigger to prevent double-completion.
- **Sequential Lesson → Module Fetch:** Inherent data dependency — lesson must load
  first to get `moduleId`. Backend could embed module data to save a round-trip.
  Noted for future optimisation.

## components/lesson/LessonContent.jsx — Function Extraction

- **Changed `getModuleNumber` — Function → Direct Computation:** Previously defined
  as a function recreated every render. Now a simple ternary expression.
- **Noted `console.warn` in Production:** Logs full lesson object if module order
  not found. Guard with env check if it triggers frequently.

## components/lesson/LessonHeader.jsx — ✅ No Changes Needed

Pure display component. Conditional rendering for completed/review states. Responsive
layout with mobile-first design.

## components/lesson/LessonNavigation.jsx — Null Safety

- **Added Optional Chaining:** `module?._id` prevents crash if module fetch fails
  silently and `module` is null. Link would still be broken but the page won't crash.

## components/lesson/ExerciseComponent.jsx — Debug Cleanup & Error Handling

- **Removed 7 Debug `console.log` Statements:** Logs firing on every exercise
  interaction (run-to-line, submit, Python ready checks). Wasted CPU and cluttered
  console in production.
- **Removed Redundant `response.data || response` Fallback:** `apiClient` interceptor
  already unwraps the response envelope. The `response.data` path was never reached.
- **Noted `setTimeout` Without Cleanup in `handleRunToLine`:** 50ms timeout for
  terminal mount — no cleanup on unmount. Optional chaining prevents crash but
  work is wasted. Low priority (50ms window is tiny).
- **Added `.catch()` to Terminal Execution Promise:** `handleTerminalExecute` used
  `.then()` without `.catch()` — unhandled promise rejection if Pyodide crashes.

## components/lesson/CodeBlock.jsx — Minor Cleanup

- **Noted `isUserCode` Prop Unused:** Destructured but never referenced. Remove or
  implement conditional styling.
- **Noted `setTimeout` Without Cleanup:** Copy feedback timer (2s) not cleared on
  unmount. Low priority — component rarely unmounts during the 2s window.

## components/lesson/CodeEditor.jsx — Extension Memoization

- **Changed `extensions` Array — Wrapped in `useMemo`:** `python()`, `lintGutter()`,
  and `createRunToHereGutter()` were creating new extension instances on every render.
  CodeMirror compares extensions by reference — new instances cause editor reconfiguration.
  Now only recreated when `onRunToLine` changes (which is stable — a `useCallback` from
  the parent). Look here if the code editor flickers or loses cursor position.

## components/lesson/TerminalComponent.jsx — Dependency Cleanup

- **Removed Unused `initialCode` from `executeCode` Dependencies:** `initialCode` was
  in the dependency array but never used inside the callback. Caused `executeCode`
  (and transitively `handleKeyDown`) to be recreated on every code change.
- **Changed `history` State Update — Functional Form:** `executeCode` used `history`
  directly to compute `newHistory`, making `history` a dependency. Now uses
  `setHistory((prev) => [...prev, code])` — removes `history` from the dependency
  array, preventing cascading re-creation of `executeCode` and `handleKeyDown` on
  every command execution.
- **Extracted `SNIPPETS` to Module Scope:** Array of 4 snippet objects was recreated
  on every render. Now a static constant outside the component.

## components/lesson/QuizComponent.jsx — Function Extraction

- **Extracted `getQuestionCardClass` and `getFeedbackContent` from `.map()`:** Both
  functions were redefined for every question on every render. For a 10-question quiz,
  that's 10 function definitions per render. Now defined at component level.
- **Noted `handleFinalSubmit` API Path:** Submits to `/content/modules/:id/submit-quiz`
  — verify this matches the actual backend route definition. Mismatch would silently
  fail module quiz submissions.

## utils/progressCalculations.js — ✅ No Changes Needed

All functions are pure, O(1) or O(n) where n is bounded (lessons per module).
`calculateModulesCompletionProgress` safely handles `totalModules === 0`.

## pages/ModuleQuizPage.jsx — API Path Fix & Logic Extraction

- **Fixed API Path — `/submit-quiz` → `/quiz`:** The frontend was posting to
  `/content/modules/:id/submit-quiz` but the backend route is
  `POST /api/content/modules/:moduleId/quiz`. Module quiz submissions would
  fail with 404. Look here if module quizzes fail to submit.
- **Extracted `shuffleArray` to `quizUtils.js`:** Fisher-Yates shuffle moved
  from component to shared utility. Added `buildShuffledOptions`,
  `getShuffledOptions`, and `getActualIndex` helpers for consistent shuffled
  option handling.
- **Moved `shuffleArray` Definition Outside Component:** Previously recreated
  on every render. Now imported from `quizUtils.js`.
- **Simplified `handleAnswerSelect` — `getActualIndex` Utility:** Replaced
  inline shuffled-index resolution (5 lines) with single utility call.
- **Removed `window.location.reload()` from `handleContinue`:** Full page
  reload was heavy-handed. Now relies on React Router navigation — the
  modules page refetches data via its `useEffect`.
- **Simplified Answer Submission — Removed `charCodeAt` Encoding:** `userAnswers`
  already stores numeric indices. The `charCodeAt` conversion was fragile and
  likely never executed. Now passes `userAnswers` directly to the API.
- **Noted IIFE in Render — Future Extraction:** The 30+ line IIFE computing
  shuffled option display and button classes should be extracted to a
  `useMemo` or helper. Noted for future cleanup.

## utils/quizUtils.js — New Shuffle & Option Utilities

- **Added `shuffleArray(array)`:** Fisher-Yates shuffle returning a new array.
  O(n) time, O(n) space.
- **Added `buildShuffledOptions(questions)`:** Builds a map of questionId →
  shuffled option indices for all questions in a quiz.
- **Added `getShuffledOptions(optionsMap, questionId, originalOptions)`:**
  Resolves display-order options from the shuffled map.
- **Added `getActualIndex(optionsMap, questionId, displayIndex)`:** Converts
  a display index back to the original option index.

## pages/TerminalPlayground.jsx — Constant Extraction

- **Extracted `LESSONS` Array to Module Scope:** Previously recreated on every
  render. Now a static constant outside the component.
- **Added `useMemo` for `initialCode`:** The `activeTab.split("-")` parsing
  was running on every render. Now computed only when `activeTab` changes.

## utils/validationUtils.js — Function Extraction

- **Extracted `normalizeOutput` to Module Scope:** The `normalize` function was
  redefined inside `validateOutputWithPyodide` on every call. Now a module-level
  pure function.

---

## Files Changed (Content Section)

| File                                          | Type of Change                                                   |
| --------------------------------------------- | ---------------------------------------------------------------- |
| `pages/ModulesPage.jsx`                       | Parallel data fetching, redundant state call                     |
| `pages/ModuleLessonsPage.jsx`                 | Effect dependency narrowing                                      |
| `pages/LessonPage.jsx`                        | Previously optimised (triple toast fix)                          |
| `components/module/ModuleCard.jsx`            | No changes needed                                                |
| `components/module/ModulesGrid.jsx`           | No changes needed                                                |
| `components/module/ModulesHeader.jsx`         | No changes needed                                                |
| `components/module/ModulesStats.jsx`          | No changes needed                                                |
| `components/module_lesson/LessonItem.jsx`     | No changes needed                                                |
| `components/module_lesson/LessonsList.jsx`    | No changes needed                                                |
| `components/module_lesson/ModuleHeader.jsx`   | No changes needed                                                |
| `components/module_lesson/ProgressCircle.jsx` | Constant extraction                                              |
| `components/module_lesson/QuickActions.jsx`   | Constant extraction                                              |
| `components/lesson/LessonContent.jsx`         | Function → direct computation                                    |
| `components/lesson/LessonHeader.jsx`          | No changes needed                                                |
| `components/lesson/LessonNavigation.jsx`      | Null safety (`module?._id`)                                      |
| `components/lesson/ExerciseComponent.jsx`     | Debug cleanup, error handling, redundant code removal            |
| `components/lesson/CodeBlock.jsx`             | Noted unused prop, timer cleanup                                 |
| `components/lesson/CodeEditor.jsx`            | Extension memoization (`useMemo`)                                |
| `components/lesson/TerminalComponent.jsx`     | Dependency cleanup, functional state update, constant extraction |
| `components/lesson/QuizComponent.jsx`         | Function extraction from `.map()`                                |
| `utils/progressCalculations.js`               | No changes needed                                                |

==========================================================================================

# PROGRESS

==========================================================================================

## pages/Dashboard.jsx — Fallback Object & Array Optimisation

- **Extracted `FALLBACK_PROGRESS` to Module Scope:** The fallback object used when
  `userProgress` is null was recreated on every render. Now a static constant outside
  the component with dynamic values (`xp`, `level`, `streak`) spread in only when
  needed.
- **Changed `recentBadges` — Simplified Chain:** Replaced `.slice().reverse().filter().slice(0,3).map()`
  (5 operations, 2 intermediate arrays) with `.filter(Boolean).slice(-3).reverse().map()`
  (4 operations, 1 intermediate array). `slice(-3)` takes the last 3 directly without
  copying the full array first. Look here if recent badges appear in wrong order.
- **Added `fetchError` Display:** Now shows `<ErrorState>` when all three dashboard
  API requests fail (hook only sets error on complete failure). Partial failures
  (e.g., leaderboard down) show fallback sections instead.

## hooks/useDashboardData.js — Partial-Failure Tolerance & Dependency Fix

- **Changed `Promise.all` → `Promise.allSettled`:** Previously one failed API request
  (e.g., leaderboard down) blocked all dashboard data. Now each request resolves
  independently — progress can display even if leaderboard fails. Error is only set
  when ALL three requests fail. Look here if dashboard shows partial data unexpectedly.
- **Removed `locationPathname` from Dependencies:** Was causing unnecessary re-fetches
  on every page navigation. The Dashboard component already remounts on navigation,
  which triggers a fresh fetch. Removed from the dependency array.
- **Added `updateTheme` to Dependencies:** Was used inside the effect but missing from
  the dependency array (stale closure risk). Now properly listed.
- **Changed Error Storage — Object → String:** Previously stored the raw Error object.
  Now stores `err.message` string for safer consumption by React components.

## hooks/useCourseThemeUpdater.js — Dependency & Failure Handling

- **Removed `location.pathname` from Dependencies:** Was causing a `GET /progress/current`
  request on every page navigation between learning pages. Theme colour only changes
  when course progress updates — not on every navigation. Now only refetches on
  authentication state changes.
- **Removed `apiClient` from Dependencies:** Module-level import with stable reference
  — unnecessary in the dependency array.
- **Removed `setDefaultTheme()` on Fetch Failure:** Previously overrode the current
  theme colour with grey on transient network errors. Now silently fails — the existing
  theme colour persists until the next successful fetch.

## hooks/useStreakNotifications.js — Missing Dependencies

- **Added Missing Dependencies:** `streak`, `weeklyProgress`, `showToast`, and
  `showConfirm` were used inside the effect but not listed in the dependency array.
  Since `notifiedStatus.current` prevents duplicate notifications, adding these deps
  doesn't cause extra toasts. Look here if streak notifications show stale streak counts.

## hooks/useConfirmActions.js — ✅ No Changes Needed

Well-structured hook — `createConfirmPromise` memoized with `useCallback`, return
object memoized with `useMemo`. Promise-based API wrapping imperative `showConfirm`.
Pre-built confirm types (delete, archive, publish, reset) with sensible defaults.

## hooks/useContentFilter.js — Array Copy & Callback Stability

- **Removed Unnecessary `[...initialContent]` Spread:** `Array.filter()` already returns
  a new array — the initial shallow copy was redundant. Saves one array allocation per
  filter change.
- **Wrapped `clearFilters` in `useCallback`:** Previously a new function reference on
  every render. Now stable reference with empty deps (only calls `setFilters`).

## hooks/useFileDownload.js — ✅ No Changes Needed

All callbacks memoized with `useCallback` + empty deps. Delegates to pure utility
functions in `fileDownloadUtils`. Clean separation of concerns.

## hooks/usePageViewTracker.js — Minor Cleanup

- **Added `apiClient` to Dependency Array:** Was used inside the effect but missing
  from deps. Stable module import in practice but lint-compliant now.
- **Noted Missing AbortController:** Rapid navigation fires multiple parallel POST
  requests with no cancellation. Analytics is best-effort — low priority.

## controllers/progressController.js — Leaderboard Query Optimisation (Backend)

- **Changed `getSurroundingLeaderboard` — O(n) → O(1):** Previously fetched ALL
  opted-in users into memory. Now uses two targeted `$gt`/`$lt` queries limited to 2
  results each + `countDocuments` for rank. Transfers at most 5 documents instead of
  potentially thousands. Look here if leaderboard surrounding users are incorrect.
- **Changed `getCurrentProgress` — O(k) → O(1) Lesson Queries:** Single `$in` query
  for all module lessons instead of per-module queries in a loop.
- **Changed `getModuleLeaderboard` — Removed Redundant Fetch:** Uses `req.user.xp`
  from auth middleware instead of a separate `User.findById` for rank calculation.
- **Removed Dead Debug Variables:** Leftover `ids`/`dupes` from duplicate leaderboard
  entry debugging.

---

## Files Changed (Progress Section)

| File                                | Type of Change                                                        |
| ----------------------------------- | --------------------------------------------------------------------- |
| `pages/Dashboard.jsx`               | Fallback object extraction, array chain simplification, error display |
| `hooks/useDashboardData.js`         | Partial-failure tolerance, dependency fixes, error type               |
| `hooks/useCourseThemeUpdater.js`    | Dependency removal, failure handling                                  |
| `hooks/useStreakNotifications.js`   | Missing dependencies                                                  |
| `hooks/useConfirmActions.js`        | No changes needed                                                     |
| `hooks/useContentFilter.js`         | Array copy removal, callback stability                                |
| `hooks/useFileDownload.js`          | No changes needed                                                     |
| `hooks/usePageViewTracker.js`       | Missing dependency                                                    |
| `controllers/progressController.js` | Leaderboard & query optimisation (backend)                            |

==========================================================================================

# MODALS & HOOKS (Additional)

==========================================================================================

## store/useModalStore.js — ✅ No Changes Needed

Clean Zustand store with minimal state — `type`, `data`, `isOpen`, plus `openModal`
and `closeModal` actions. No derived state, no middleware, no complexity.

## hooks/useModal.js — ✅ No Changes Needed

Thin wrapper around `useModalStore` — provides clean API boundary. Kept for
API stability despite being a single store call.

## components/ui/BaseModal.jsx — Constant Extraction

- **Extracted `SIZE_CLASSES` and `FOOTER_ALIGN_CLASSES` to Module Scope:** Two
  lookup objects were recreated on every render. Now static constants outside
  the component. Look here if modal sizing breaks after update.
- **Noted `setTimeout` Without Cleanup:** Focus restoration uses a 100ms timeout
  without clearing on unmount. Ref check prevents crash but work is wasted.
  Low priority — 100ms window is tiny.
- **Noted `querySelectorAll` on Every Tab Press:** Focus trapping queries the DOM
  on each Tab keypress. For modals with few elements this is fast — acceptable
  for infrequent modal interactions.

## modals/ModalManager.jsx — ✅ No Changes Needed

Clean orchestration — reads from Zustand store, dynamically resolves modal
component via `Modals[type]` (O(1) lookup). Graceful error handling for
missing modal types. Single responsibility.

## modals/BadgeModal.jsx — Set Memoization

- **Wrapped `earnedSet` in `useMemo`:** Previously `new Set(earnedBadgeIds)` on
  every render. Now only recalculated when `earnedBadgeIds` changes.

## modals/LeaderboardModal.jsx — Dedup Optimisation & Deps Fix

- **Changed `visibleSurroundingUsers` — O(n\*m) → O(n+m):** Previously used
  `.filter()` + `.some()` (nested loop). Now converts `topUsers` to a `Set`
  via `useMemo` for O(1) lookup per surrounding user. Look here if
  surrounding users appear duplicated in the leaderboard modal.
- **Removed `initialSurroundingUsers` and `initialUserRank` from Effect Deps:**
  These props change on every parent re-render, causing unnecessary
  leaderboard re-fetches. They're initial values — only needed on first open.
  Removed from dependency array.

## modals/ReportModal.jsx — Error Handling Consistency

- **Changed Error Extraction — `err.response?.data?.message` → `getErrorMessage(err)`:**
  The manual error path was fragile (didn't handle network errors, plain strings,
  or the unwrapped response from `apiClient`). Now uses the standard
  `getErrorMessage` utility for consistent error messages across the app.

## hooks/useConfirmActions.js — ✅ No Changes Needed

Well-structured hook — `createConfirmPromise` memoized with `useCallback`, return
object memoized with `useMemo`. Promise-based API wrapping imperative `showConfirm`.
Pre-built confirm types with sensible defaults.

## hooks/useContentFilter.js — Array Copy & Callback Stability

- **Removed Unnecessary `[...initialContent]` Spread:** `Array.filter()` already
  returns a new array — the initial shallow copy was redundant. Saves one
  allocation per filter change.
- **Wrapped `clearFilters` in `useCallback`:** Previously a new function reference
  on every render. Now stable with empty deps.
- **Noted `handleSort` Recreation:** Recreated every render — consider `useCallback`
  if admin table re-render issues appear.

## hooks/useFileDownload.js — ✅ No Changes Needed

All callbacks memoized with `useCallback` + empty deps. Delegates to pure
utility functions. Clean separation.

## hooks/usePageViewTracker.js — Missing Dependency

- **Added `apiClient` to Dependency Array:** Was used inside the effect but
  missing from deps. Stable module import in practice — lint-compliant now.

---

## Files Changed (Modals & Hooks Section)

| File                          | Type of Change                         |
| ----------------------------- | -------------------------------------- |
| `store/useModalStore.js`      | No changes needed                      |
| `hooks/useModal.js`           | No changes needed                      |
| `components/ui/BaseModal.jsx` | Constant extraction                    |
| `modals/ModalManager.jsx`     | No changes needed                      |
| `modals/BadgeModal.jsx`       | Set memoization                        |
| `modals/LeaderboardModal.jsx` | Dedup optimisation, effect deps fix    |
| `modals/ReportModal.jsx`      | Error handling consistency             |
| `hooks/useConfirmActions.js`  | No changes needed                      |
| `hooks/useContentFilter.js`   | Array copy removal, callback stability |
| `hooks/useFileDownload.js`    | No changes needed                      |
| `hooks/usePageViewTracker.js` | Missing dependency                     |

==========================================================================================

# UI COMPONENTS (Additional)

==========================================================================================

## components/ui/ImageViewer.jsx — Cleanup & Cancellation

- **Added Cleanup for Rotate Hint Timer:** The 3-second auto-hide timer now stores
  its ID in a ref and clears on modal close. Previously the timeout could fire
  `setState` on an unmounted component if the viewer closed within 3 seconds.
- **Added `cancelled` Flag to Image Load Effect:** `new Image()` preload now checks
  a cancellation flag before setting state. Prevents state updates if the component
  unmounts before the image loads.
- **Noted `window.innerWidth` in Render:** Checked during render for responsive
  caption hints. Not reactive to window resize — minor edge case for image viewing.

## components/ui/LeaderboardRow.jsx — Function Extraction

- **Extracted `getRankDisplay` to Module Scope:** Previously defined inside the
  component, recreated on every render of every leaderboard row. Now a module-level
  function using a `RANK_MEDALS` lookup object. Look here if medal emojis stop
  appearing for top 3 ranks.

## components/ui/MarkdownRenderer.jsx — Major Memoization Pass

- **Extracted `parseContent` and `slugifyHeading` to `utils/markdownUtils.js`:**
  Pure parsing logic moved to a shared utility. The component now imports these
  instead of defining them internally.
- **Extracted `CONTAINER_STYLES` and `CONTAINER_TEXT_COLORS` to Module Scope:**
  Large nested configuration objects were recreated on every render (and per
  container). Now static constants outside the component.
- **Wrapped `markdownComponents` in `useMemo`:** 16 React component definitions
  (some 60+ lines) were recreated on every render. Now only recreated when
  `activeDark` or `moduleId` changes. This is the single largest render saving
  in the UI layer. Look here if markdown rendering breaks after theme changes.
- **Wrapped `dynamicComponents` in `useMemo`:** 12 component definitions for
  container content. Recreated only on `activeDark` changes.
- **Wrapped `CustomContainer` in `useMemo`:** Container sub-component recreated
  only when `activeDark` or `dynamicComponents` changes.
- **Wrapped `parsedContent` in `useMemo`:** Content was re-parsed (splitting by
  newlines, iterating all lines) on every render. Now only re-parsed when
  `content` changes.
- **Removed Debug `console.log`:** Leftover `console.log("img inside container:", src)`
  removed.
- **Inlined `ContainerContent` into `CustomContainer`:** Removed unnecessary
  intermediate sub-component.

## utils/markdownUtils.js — New File

- **Added `slugifyHeading(text)`:** Converts heading text to URL-safe slug for
  anchor links.
- **Added `parseContent(text)`:** Splits markdown content into regular sections
  and `:::container:::` blocks. Returns structured array for the renderer.
  Extracted from `MarkdownRenderer.jsx`.

## components/ui/PythonSyntaxHighlighter.jsx — Regex Extraction

- **Extracted `KEYWORDS_REGEX`, `BUILTINS_REGEX`, `STRINGS_REGEX`, `NUMBERS_REGEX`
  to Module Scope:** Four regex literals were recreated on every line of every
  code block. For a 50-line snippet, that's 200 regex allocations per render.
  Now static module-level constants. Look here if syntax highlighting colors
  are incorrect.
- **Extracted `getPatterns(isDark)` to Module Scope:** Patterns array with
  theme-aware class names was recreated per line. Now a module-level function
  returning the appropriate patterns for the current theme.
- **Changed `new RegExp()` Per Pattern Per Line → Clone Once Per Call:** Previously
  created a new RegExp instance for each pattern on each line. Now clones the
  patterns array once at the top of `highlightCode`. Reduces allocations from
  O(lines × patterns) to O(lines × 1).
- **Fixed Typo:** `higlightPython` → `highlightPython` (internal function, no
  consumer impact).

## components/ui/RefreshButton.jsx — ✅ No Changes Needed

Clean, simple component. Properly disabled during loading, accessible.

## components/ui/SearchableSelect.jsx — Filter Memoization

- **Wrapped `filteredOptions` in `useMemo`:** Previously recalculated on every
  render (`.toLowerCase()` + `.includes()` on every option) even when the
  dropdown was closed and `searchTerm` unchanged. Now only recalculates when
  `options` or `searchTerm` change.

## components/ui/SegmentedLevelProgressBar.jsx — Function Extraction

- **Extracted `getSegmentColor` to Module Scope:** Previously redefined inside
  the component on every render. Called up to 20 times per render (once per
  segment). Now a module-level pure function.
- **Removed Unused `getModuleThemeColor` Destructure:** Was imported from
  `useTheme()` but never called. Color logic uses `getSegmentColor` instead.

## components/ui/ThemeToggle.jsx — ✅ No Changes Needed

Clean, simple component. Single responsibility, proper accessibility.

---

## Files Changed (UI Components Section)

| File                                          | Type of Change                                        |
| --------------------------------------------- | ----------------------------------------------------- |
| `components/ui/ImageViewer.jsx`               | Timer cleanup, image load cancellation                |
| `components/ui/LeaderboardRow.jsx`            | Function extraction                                   |
| `components/ui/MarkdownRenderer.jsx`          | Major memoization, static extraction, util extraction |
| `utils/markdownUtils.js`                      | New file — parsing & slug utilities                   |
| `components/ui/PythonSyntaxHighlighter.jsx`   | Regex extraction, allocation reduction                |
| `components/ui/RefreshButton.jsx`             | No changes needed                                     |
| `components/ui/SearchableSelect.jsx`          | Filter memoization                                    |
| `components/ui/SegmentedLevelProgressBar.jsx` | Function extraction, unused import removal            |
| `components/ui/ThemeToggle.jsx`               | No changes needed                                     |

==========================================================================================

# ADMIN

==========================================================================================

## pages/AdminAnalytics.jsx — Fetch Stability

- **Wrapped `fetchAnalytics` in `useCallback`:** Previously recreated on every
  render, causing `useAdminData` to receive a new function reference each time.
  Now stable with `[dateRange, groupBy]` dependencies. Look here if analytics
  dashboard re-fetches data on every render.
- **Three `useMemo` Hooks — Kept Separate:** `chartData`, `growthData`, and
  `deviceData` each depend on `data` and do simple `.map()` transformations.
  Could be combined but separation is cleaner and arrays are small (~30 entries).

## pages/AdminDashboard.jsx — Fetch & Filter Stability

- **Wrapped `fetchDashboardData` in `useCallback` with `[]`:** No external
  dependencies — fetches the same two endpoints every time. Stable reference
  prevents unnecessary re-renders in `useAdminData`.
- **Extracted `filteredUsers` to `useMemo`:** Previously computed inline in JSX
  with `.filter()` on every keystroke (calling `toLowerCase()` twice per user).
  Now only recalculates when `allUsers` or `userSearchQuery` change.
- **Improved Empty State Messaging:** User selector modal now distinguishes
  between "No users found" (no users loaded) and "No users match your search"
  (filter returned empty).

## pages/AdminContentPage.jsx — ✅ No Changes Needed

Pure wrapper — delegates to `ContentManagementTable`.

## pages/AdminFlagged.jsx — ✅ No Changes Needed

Pure wrapper — delegates to `FlaggedContentList`.

## pages/AdminSettings.jsx — ✅ No Changes Needed

Pure wrapper — delegates to `AdminSettingsPanel`.

## pages/AdminUsers.jsx — ✅ No Changes Needed

Pure wrapper — delegates to `UserManagementTable`.

## hooks/useAdminData.js — Retry & Unmount Safety

- **Added `mountedRef` Cleanup:** Prevents state updates after component
  unmount. Previously retry `setTimeout` could fire `setState` on an unmounted
  component. Look here if you see "Can't perform a React state update on an
  unmounted component" warnings.
- **Changed Retry Loading State:** `loading` now stays `true` during the retry
  window instead of flashing `false` between attempts. Eliminates content flash
  during auto-retry sequences.
- **Retry `setTimeout` Checks `mountedRef`:** Prevents retry execution after
  unmount.
- **Added `fetchData` to Effect Dependencies:** Previously missing from the
  dependency array (stale closure risk). Now properly listed. Callers documented
  as needing `useCallback`-wrapped `fetcher` functions.
- **Added JSDoc Warning:** `fetcher` MUST be wrapped in `useCallback` by the
  caller to prevent infinite re-fetch loops.

## hooks/useAdminMutation.js — Dependency Stability

- **Destructured `confirmationOptions` at Top with Defaults:** Previously
  individual properties (`confirmationOptions.title`, `.message`, etc.) were
  listed separately in the dependency array — fragile and verbose. Now
  destructured once with fallback values, providing stable primitive
  dependencies. Added `type` support for confirmation dialogs (was missing).
- **Added `showConfirm` and `confirmType` to Dependency Array:** Previously
  missing — `showConfirm` is stable from `NotificationContext` in practice but
  now properly listed for lint compliance.

---

## Files Changed (Admin Section)

| File                         | Type of Change                                        |
| ---------------------------- | ----------------------------------------------------- |
| `pages/AdminAnalytics.jsx`   | `useCallback` for fetch function                      |
| `pages/AdminDashboard.jsx`   | `useCallback` for fetch, `useMemo` for filtered users |
| `pages/AdminContentPage.jsx` | No changes needed                                     |
| `pages/AdminFlagged.jsx`     | No changes needed                                     |
| `pages/AdminSettings.jsx`    | No changes needed                                     |
| `pages/AdminUsers.jsx`       | No changes needed                                     |
| `hooks/useAdminData.js`      | Unmount safety, retry loading fix, dependency fix     |
| `hooks/useAdminMutation.js`  | Dependency stability, missing deps                    |

==========================================================================================

# ADMIN COMPONENTS

==========================================================================================

## components/admin/AdminLayout.jsx — ✅ No Changes Needed

Clean layout wrapper. Sidebar closes on mobile navigation via `location.pathname`
effect. Minor: `window.innerWidth` only read once on mount (no resize listener)
but sidebar is manually toggled via hamburger button. Inline SVG icon noted for
future lucide-react migration.

## components/admin/AdminPage.jsx — ✅ No Changes Needed

Pure wrapper — delegates to `AdminPageHeader`. PropTypes included for dev validation.

## components/admin/AdminPageHeader.jsx — ✅ No Changes Needed

Simple presentational component. Title, description, optional action slot.
Responsive layout.

## components/admin/AdminSidebar.jsx — Fetch Stability

- **Wrapped `fetchStats` in `useCallback`:** Inline `async () => adminApiClient.get("/stats")`
  was recreated every render, causing `useAdminData` to re-fetch on every render.
  Now stable with `[]` dependencies. Look here if sidebar badge counts flicker or
  re-fetch constantly.
- **Noted Stats Re-fetch on Navigation:** Sidebar fetches `/admin/stats` on every
  mount. Acceptable for admin pages (low traffic). Could be moved to context for
  cross-page caching.

## components/admin/AdminStatsCard.jsx — Constant Extraction

- **Extracted `COLOR_CLASSES` to Module Scope:** Previously recreated on every render
  of every stat card. Now a static constant outside the component.
- **Noted Inline SVG Arrow:** Could use `ChevronRight` from lucide-react for consistency.

## components/admin/ContentManagementTable.jsx — Dynamic Tailwind Fix

- **Fixed `getDifficultyBadge` — Dynamic Tailwind Classes:** Replaced
  `bg-${config.color}-100` pattern with `DIFFICULTY_STYLES` map containing
  complete class strings. Dynamic classes are not detected by Tailwind's JIT
  scanner and would silently fail in production. Look here if difficulty badges
  have no background color in production.
- **Extracted `SortIcon` to Module Scope:** Previously defined as an inline
  component inside `ContentManagementTable`, recreated on every render. Now
  accepts `sortConfig` as a prop instead of closing over component state.
- **Extracted `TYPE_ICON` Map to Module Scope:** Replaced `getTypeIcon` function
  with a static lookup object.
- **Noted `Promise.all` on Bulk Operations:** Selecting 50+ items and bulk
  deleting fires 50 parallel API requests. Acceptable for admin (infrequent).

## components/admin/FlaggedContentList.jsx — Dynamic Tailwind Fix & Mutation Callback

- **Fixed `StatCard` — Dynamic Tailwind Classes:** Replaced
  `bg-${config.color}-100` with `STATUS_ICON_COLORS` map. Same JIT issue.
- **Fixed `FlagCard` — Dynamic Tailwind Classes:** Status and issue type badges
  now use complete class strings from updated config.
- **Fixed `onSuccess` Callback — Not Supported by `useAdminMutation`:** The
  `resolveFlag` mutation passed `onSuccess` in options, but `useAdminMutation`
  doesn't support it. Callbacks were silently ignored — flags wouldn't refresh
  after resolution. Now calls refresh functions manually after mutate.
- **Noted `useDebounce` Location:** Defined in component file. Should be moved
  to `/hooks/useDebounce.js` for reuse.

## constants/adminConstants.js — Tailwind Class String Migration

- **Added `bg`, `text`, `iconBg`, `badge` Properties to `FLAG_STATUS_CONFIG`:**
  Each status now includes complete Tailwind class strings for backgrounds,
  text colors, icon containers, and badges. The `color` property is retained
  for non-Tailwind uses (charts, inline styles). Look here if status badges
  or stat cards lose their coloring.
- **Added `badge` Property to `ISSUE_TYPE_CONFIG`:** Each issue type now includes
  a complete class string for badge rendering.
- **Added Class Strings to `getStatusConfig` Fallback:** Unknown statuses now
  get complete gray-themed class strings instead of just a color name.

## hooks/useAdminData.js — Retry & Unmount Safety (Previously Documented)

Already covered in the ADMIN section above.

## hooks/useAdminMutation.js — Dependency Stability (Previously Documented)

Already covered in the ADMIN section above.

## hooks/useSettingsManager.js — Callback Stability & Return Safety

- **Wrapped `updateSetting` in `useCallback`:** Previously recreated every render,
  passed as `onChange` to every `SettingInput`. Now stable with `[originalSettings]`
  dependency. Look here if settings inputs feel laggy or re-render excessively.
- **Changed `getChangedSettings` — Returns Copy:** Previously returned the raw
  `changes` state object by reference. Now returns `{ ...changes }` to prevent
  accidental mutation by callers.

## hooks/useConfirmActions.js — ✅ No Changes Needed

Already reviewed in MODALS & HOOKS section. Well-structured with proper memoization.

## components/admin/AdminSettingsPanel.jsx — Theme Change Detection Fix

- **Fixed Theme Change Check — Reading `changes` After `resetChanges()`:** Previously
  called `settingsManager.resetChanges()` BEFORE checking if theme settings had
  changed, so the check always saw an empty object. Now reads `changedSettings`
  before resetting. Look here if "Theme changes may require a page refresh" toast
  never appears.
- **Extracted `ICON_MAP` to Module Scope:** Previously recreated every render.

## components/admin/AdminTabPreview.jsx — Props Destructuring Bug Fix

- **Fixed Props Destructuring — `(tab, settings)` → `({ tab, settings })`:** React
  components receive a single props object, not separate arguments. The component
  was treating the props object as `tab` and `settings` as `undefined`, causing
  all switch cases to fail silently and the component to always return `null`.
  The theme preview, gamification calculator, platform status, and security
  recommendations have likely never been visible. Look here if the settings
  preview panel is always empty.

## components/admin/SaveStatusIndicator.jsx — ✅ No Changes Needed

Clean presentational component. Returns `null` when no changes, shows floating
indicator with count otherwise. PropTypes included.

## components/admin/SettingInput.jsx — Memo Comparator Simplification

- **Removed Custom `memo` Comparator with `JSON.stringify`:** The custom comparator
  called `JSON.stringify` on `options` objects on every props comparison. For 30
  settings inputs, that's up to 60 `JSON.stringify` calls per parent render.
  Replaced with React's default shallow comparison — `options` comes from static
  config (`SETTINGS_CONFIGS`) so references are stable. Look here if settings
  inputs don't update when options change.
- **Sub-Components at Module Scope:** `ColorInput`, `SelectInput`, `ToggleInput`,
  `NumberInput`, `RangeInput`, `TextInput` all defined outside the component —
  no closure dependencies, stable references. Correct pattern.

## components/admin/UserManagementTable.jsx — Callback & Constant Extraction

- **Wrapped `handleXPAdjust` in `useCallback`:** Previously recreated every render,
  passed as `onSave` to `XPAdjustmentModal`. Now stable with `[showToast, refresh]`.
- **Wrapped `handleSort` in `useCallback`:** Recreated every render, passed to every
  column header button. Now stable with `[]`.
- **Extracted `INITIAL_FILTERS` and `TABLE_COLUMNS` to Module Scope:** Previously
  recreated on every render.

## components/admin/UserTableFilters.jsx — Debounce & Callback Fix

- **Fixed Debounce Effect — Skipped Initial Mount:** The debounce `useEffect` was
  firing on mount with empty level values, triggering an unnecessary API call after
  500ms. Now uses a `useRef` flag to skip the initial mount. Look here if level
  filters don't apply on first use.
- **Wrapped `handleSelectChange` and `handleNumericChange` in `useCallback`:**
  Previously recreated every render. Now stable with `[]` dependencies.

---

## Files Changed (Admin Components Section)

| File                                          | Type of Change                                  |
| --------------------------------------------- | ----------------------------------------------- |
| `components/admin/AdminLayout.jsx`            | No changes needed                               |
| `components/admin/AdminPage.jsx`              | No changes needed                               |
| `components/admin/AdminPageHeader.jsx`        | No changes needed                               |
| `components/admin/AdminSidebar.jsx`           | `useCallback` for fetch                         |
| `components/admin/AdminStatsCard.jsx`         | Constant extraction                             |
| `components/admin/ContentManagementTable.jsx` | Dynamic Tailwind fix, function extraction       |
| `components/admin/FlaggedContentList.jsx`     | Dynamic Tailwind fix, mutation callback fix     |
| `components/admin/AdminSettingsPanel.jsx`     | Theme change detection fix, constant extraction |
| `components/admin/AdminTabPreview.jsx`        | Props destructuring bug fix                     |
| `components/admin/SaveStatusIndicator.jsx`    | No changes needed                               |
| `components/admin/SettingInput.jsx`           | Memo comparator simplification                  |
| `components/admin/UserManagementTable.jsx`    | Callback & constant extraction                  |
| `components/admin/UserTableFilters.jsx`       | Debounce fix, callback stability                |
| `constants/adminConstants.js`                 | Tailwind class string migration                 |
| `hooks/useAdminData.js`                       | Previously documented                           |
| `hooks/useAdminMutation.js`                   | Previously documented                           |
| `hooks/useSettingsManager.js`                 | Callback stability, return safety               |
| `hooks/useConfirmActions.js`                  | No changes needed                               |

==========================================================================================

# ANALYTICS COMPONENTS

==========================================================================================

## components/analytics/MetricsGrid.jsx — Dynamic Tailwind Fix

- **Fixed Dynamic Tailwind Classes — `METRIC_COLORS` Map:** Replaced
  `bg-${metric.color}-100` and `text-${metric.color}-600` with static
  `METRIC_COLORS` lookup object containing complete class strings. Same JIT
  issue as other admin components. Look here if metric icon backgrounds or
  colors are missing in production.
- **Noted `metrics` Array Recreation:** Array of 4 metric objects recreated
  every render. Low priority — 4 elements is trivial.

## components/analytics/QuickStats.jsx — Minor

- **Noted `stats` Array Recreation:** Array of 4 stat objects recreated every
  render. Gradient classes are hardcoded strings (`"from-blue-500"`) so Tailwind
  detects them correctly. Low priority.

## components/analytics/TopContent.jsx — ✅ No Changes Needed

Clean presentational component. Static display with no state or effects.

## components/analytics/UserSegmentation.jsx — Constant Extraction

- **Extracted `COLORS` to Module Scope as `SEGMENT_COLORS`:** Previously
  recreated on every render.

---

## Files Changed (Analytics Section)

| File                                        | Type of Change       |
| ------------------------------------------- | -------------------- |
| `components/analytics/MetricsGrid.jsx`      | Dynamic Tailwind fix |
| `components/analytics/QuickStats.jsx`       | Minor (noted)        |
| `components/analytics/TopContent.jsx`       | No changes needed    |
| `components/analytics/UserSegmentation.jsx` | Constant extraction  |
