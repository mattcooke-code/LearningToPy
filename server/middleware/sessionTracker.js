// middleware/sessionTracker.js
const sessionService = require("../services/sessionService");
const { isValidSessionId } = require("../utils/sessionId");

/**
 * Session tracking middleware.
 *
 * 1. Reads the client-generated session ID from `x-session-id`, validates it,
 *    and exposes it as `req.sessionId` (undefined if absent or malformed).
 *    The server never invents session IDs: the client only sends the header
 *    for logged-in users, and an ID the client didn't create is meaningless.
 * 2. When the response finishes, if the request turned out to be authenticated
 *    (`protect` has run by then and set req.user / req.userId), records activity
 *    for that (user, session) via sessionService.touch — fire-and-forget and throttled.
 *
 * Doing this on `finish` is what lets one global middleware see the user even
 * though `protect` is applied per-route.
 *
 * @middleware Mount once, after rate limiting and before the API routers:
 *             app.use("/api/", sessionTracker);
 */
const sessionTracker = (req, res, next) => {
  const header = req.headers["x-session-id"];
  req.sessionId = isValidSessionId(header) ? header : undefined;

  if (req.sessionId) {
    res.on("finish", () => {
      const userId = req.user?._id || req.userId;
      if (!userId) return;

      sessionService.touch({
        userId,
        sessionId: req.sessionId,
        headers: req.headers,
        ip: req.ip,
      });
    });
  }

  next();
};

module.exports = sessionTracker;
