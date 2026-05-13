# Middleware

Express middleware functions. Applied in a specific order in `server.js`.

## Registration Order (in server.js)

1. **`rateLimiter.js` — `ipBlocker`** — Reject known bad IPs before anything else
2. **`rateLimiter.js` — `abuseDetector`** — Detect and block suspicious patterns
3. **`rateLimiter.js` — per-route limiters** — Applied on specific routes (auth, admin, content)
4. **`sessionTracker.js`** — Assign session IDs, log SESSION_START events
5. **`activityTracker.js`** — Record user actions to ActivityLog
6. **`auth.js` — `protect`** — Verify JWT, attach user to request
7. **`adminOnly.js`** — Restrict routes to admin users
8. **`validation.js`** — Validate request bodies before controllers
9. **`pythonSandbox.js`** — Create isolated VM for code execution
10. **`errorHandler.js`** — Global error handler (registered last)

---

## activityTracker.js

- **Applied:** Selectively via `trackActivity('ACTION_TYPE')` on specific routes
- **Responsibility:** Fire-and-forget ActivityLog entries on successful (2xx) responses
- **Captures:** userId, actionType, sessionId, lesson/module IDs, device info, anonymised IP
- **Exports:** `trackActivity`, `addActivityMetadata`

## adminOnly.js

- **Applied:** Per-route after `protect`
- **Responsibility:** Returns 403 if `req.user.isAdmin !== true`
- **Requires:** `protect` middleware to run first
- **Exports:** `adminOnly`

## auth.js

- **Applied:** On protected route groups via `router.use(protect)`
- **Responsibility:** Extracts Bearer token, verifies JWT, looks up user, checks block status
- **Attaches:** `req.user`, `req.userId`
- **Errors:** 401 (no token, invalid, expired, user not found, blocked)
- **Exports:** `protect`

## errorHandler.js

- **Applied:** Last in the middleware chain
- **Responsibility:** Formats errors via `sendJsonResponse`. Shows debug details in development, generic messages in production. Distinguishes operational errors from programming bugs.
- **Exports:** `globalErrorHandler` (default export)

## pythonSandbox.js

- **Applied:** On terminal/practice routes
- **Responsibility:** Creates a `vm2` VM with 5s timeout, restricted modules, no eval/fs/wasm
- **Attaches:** `req.pythonVM`
- **Exports:** `pythonSandbox`

## rateLimiter.js

- **Applied:** `ipBlocker` and `abuseDetector` globally; specific limiters per route
- **Responsibility:** Tiered rate limiting (API: 100/15min, Auth: 5/15min, Password: 3/1hr, Content: 10/1hr, Admin: 20/1hr). IP blocking for abuse (>100 req/min = 1hr block).
- **Exports:** `apiLimiter`, `authLimiter`, `passwordResetLimiter`, `contentCreationLimiter`, `adminActionLimiter`, `ipBlocker`, `createRateLimiter`, `abuseDetector`

## sessionTracker.js

- **Applied:** Globally before routes
- **Responsibility:** Generates unique session IDs, logs SESSION_START events, records `req.startTime`
- **Exports:** `sessionTracker` (default export)

## validation.js

- **Applied:** Per-route before controllers
- **Responsibility:** Input validation using `validationHelpers.js`. Includes specific validators for registration, login, password reset, profile update, content, flags, admin actions, and password changes. Also exports a `createValidator` factory.

### Exports

| Export                         | Description                                          |
| ------------------------------ | ---------------------------------------------------- |
| `validateUserRegistration`     | Username, email, password validation                 |
| `validateUserLogin`            | Credential format check                              |
| `validatePasswordReset`        | Email format validation                              |
| `validatePasswordResetConfirm` | Token presence + new password strength               |
| `validatePasswordChange`       | Current password + new password strength + mismatch  |
| `validateProfileUpdate`        | Optional username/email validation                   |
| `validateContent`              | Title, description, content XSS checks               |
| `validateFlaggedContent`       | Flag submission: title, description, issueType, etc. |
| `validateAdminAction`          | Admin action type + reason                           |
| `validateIPAddress`            | IP format check (logs warning, doesn't block)        |
| `validateSessionId`            | Session ID format validation                         |
| `createValidator`              | Factory: build custom validators from rule objects   |
