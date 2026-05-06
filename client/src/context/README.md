# Context

State management layer. Provides global state and actions to the component tree via React Context.

Each context file exports a **Provider** component (wraps children with state) and a **consumer hook** (`useX()`) for accessing that state from any descendant component.

## Architecture

App.jsx
└── ThemeProvider ← UI theme, accent colours, code theme
└── NotificationProvider ← Toasts, confirmation modals
└── AuthProvider ← Authentication, user state, token management
└── PythonProvider ← Pyodide Web Worker (Python execution)
└── `<Routes />`

**Nesting order matters:**

- `ThemeProvider` is outermost — even login/logout flows need theme.
- `NotificationProvider` wraps `AuthProvider` — auth actions use toast notifications.
- `AuthProvider` wraps `PythonProvider` — Python execution is only available when authenticated.
- `PythonProvider` is innermost — not all pages need it, but it's harmless when idle.

---

## AuthContext.jsx

- **Provider:** `<AuthProvider>`
- **Hook:** `useAuth()`
- **Depends on:** `NotificationContext` (toast notifications), `services/api.js` (Axios instances + interceptors), `services/session.js` (session tracking), `utils/tokenUtils.js` (token validation)
- **Responsibility:** Full authentication lifecycle — login, register, logout, token refresh, user profile fetching, automatic Authorization header injection across three Axios instances. Manages token refresh deduplication queue and session-end analytics beacons.
- **Design:** Token refresh uses a request-deduplication pattern — concurrent 401 responses that arrive while a refresh is in-flight are queued and resolved/rejected together. Logout is guarded against concurrent calls via a ref. User object updates use deep-equality checks to avoid unnecessary re-renders.
- **Exposes:** `user`, `accessToken`, `loading`, `authError`, `isAuthenticated`, `login()`, `register()`, `logout()`, `refreshAuthToken()`, `updateUser()`, `isUserAdmin()`, `leaderboardVersion`, `triggerLeaderboardRefresh()`, `sessionId`

---

## NotificationContext.jsx

- **Provider:** `<NotificationProvider>`
- **Hook:** `useNotification()`
- **Depends on:** `components/ui/BaseModal` (modal overlay)
- **Responsibility:** Toast notification system (bottom-center, auto-dismiss) and confirmation modal dialogs (two-button, type-styled). Both can be triggered from anywhere in the tree without prop drilling.
- **Design:** Toasts are assigned UUIDs and auto-removed after a configurable duration (default 5s). The confirmation modal wraps callbacks to auto-close before executing. The context value is memoised to prevent unnecessary re-renders.
- **Exposes:** `showToast(message, type?, duration?)`, `showConfirm({ title, message, onConfirm, onCancel?, type?, confirmText?, cancelText? })`, `closeConfirm()`

---

## PythonContext.jsx

- **Provider:** `<PythonProvider>`
- **Hook:** `usePython()`
- **Depends on:** `/pyodide.worker.js` (Web Worker, served from /public)
- **Responsibility:** Manages a Pyodide Web Worker for client-side Python execution. Handles worker lifecycle (create, terminate, restart on timeout), message correlation via unique execution IDs, stdout buffering, and timeout enforcement.
- **Design:** Worker is created on mount and terminated on unmount. If execution exceeds the timeout (default 10s), the worker is forcibly terminated and re-created — this resets Pyodide state. Pending requests and stdout buffers use Maps keyed by execution ID. Unlike other context hooks, `usePython()` does not throw if used outside a provider — it returns `undefined`, allowing pages that don't need Python to simply skip the guard.
- **Exposes:** `isReady`, `isLoading`, `runCode(code, timeout?)`

---

## ThemeContext.jsx

- **Provider:** `<ThemeProvider>`
- **Hook:** `useTheme()`
- **Depends on:** `constants/themeConstants` (THEME_COLORS), `utils` (`resolveCourseThemeColor`)
- **Responsibility:** Three independent theme dimensions — UI theme (light/dark via `dark` class on `<html>`), accent colour (progress-based: red→orange→amber→yellow→lime→green), and code editor theme (dark/light, independent of UI). All preferences persist to localStorage.
- **Design:** Rehydrates from localStorage on mount. Exposes `resetTheme()` globally on `window` so AuthContext's logout flow can reset themes without importing ThemeContext (avoiding a potential circular dependency). Progress-to-colour mapping is split: overall course progress uses `resolveCourseThemeColor` from utils, while module-level progress uses the inline `getModuleThemeColor` bands.
- **Exposes:** `themeColor`, `updateThemeFromCourseProgress(percentage)`, `getModuleThemeColor(percentage)`, `resetTheme()`, `setDefaultTheme()`, `THEME_COLORS`, `uiTheme`, `isDarkMode`, `setUiTheme(theme)`, `toggleDarkMode()`, `UI_THEMES`, `codeTheme`, `toggleCodeTheme()`, `setCodeTheme(theme)`, `isCodeDark`, `CODE_THEMES`

---

## Related Services

Context files delegate infrastructure logic to dedicated service modules:

| Service               | Used By       | Responsibility                                                                                                                    |
| --------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `services/api.js`     | `AuthContext` | Three Axios instances (`apiClient`, `authApiClient`, `adminApiClient`), analytics headers, response unwrapping, auth interceptors |
| `services/session.js` | `AuthContext` | Session ID generation, device info gathering, session-end beacon tracking                                                         |

## Related Utilities

| Utility               | Used By                                  | Responsibility                                                                   |
| --------------------- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| `utils/tokenUtils.js` | `AuthContext`, `services/api.js`         | JWT storage read (`getStoredAccessToken`) and expiry validation (`isTokenValid`) |
| `utils/deviceInfo.js` | `services/session.js`, `services/api.js` | Browser/platform/screen detection                                                |
| `utils/index.js`      | `AuthContext`                            | `getErrorMessage` for user-friendly error extraction                             |
