# Services

Infrastructure and integration layer. Called by context providers, not components directly.

## api.js

- **Called by:** `AuthContext` (imports instances + `setupInterceptors`), any component needing direct API access
- **Responsibility:** Creates and exports three pre-configured Axios instances (`apiClient`, `authApiClient`, `adminApiClient`), applies analytics headers (session ID, device info, page path) to every request, unwraps the backend's `{ data: <payload> }` envelope, and exports `setupInterceptors` for auth token injection and 401/403 refresh-and-retry logic
- **Design:** Instances are created at module scope (singletons). Analytics headers can be skipped per-request via `config.skipAnalytics = true`. Response unwrapping is applied as a success interceptor — error responses pass through unchanged. Auth interceptors are not applied at module scope; they're wired up by `AuthContext` on mount and ejected on unmount
- **Depends on:** `axios`, `services/session.js`, `utils/deviceInfo.js`, `utils/tokenUtils.js`

## session.js

- **Called by:** `AuthContext` (session-end tracking), `services/api.js` (analytics headers)
- **Responsibility:** Session ID generation and retrieval (UUID v4, persisted to localStorage), device/browser/platform/screen information gathering, and session-end beacon tracking via `navigator.sendBeacon` on tab close or navigation away
- **Design:** Session ID persists across page reloads but is cleared on logout. Session-end tracking uses the `beforeunload` event with `sendBeacon` for reliable delivery even during page teardown. Device info is gathered fresh at each call (not cached) to capture screen/window changes
- **Depends on:** `uuid`, `utils/deviceInfo.js`
