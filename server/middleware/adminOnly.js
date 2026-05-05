// middleware/adminOnly.js
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

/**
 * Admin authorization middleware — must run AFTER `protect` (auth middleware).
 *
 * Checks that the authenticated user has `isAdmin: true`.
 * Also re-verifies the account isn't blocked (defense in depth).
 *
 * **Error responses:**
 * - 401: No authenticated user (protect middleware not applied or failed)
 * - 403: Account blocked or not an admin
 *
 * @middleware Applied per-route or per-router after `protect`
 *
 * @example
 *   router.delete('/lessons/:id', protect, adminOnly, deleteLesson);
 */
const adminOnly = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Authentication required", 401));
  }

  if (req.user.isBlocked) {
    return next(new AppError("Your account has been blocked", 403));
  }

  if (req.user.isAdmin === true) {
    next();
  } else {
    return next(new AppError("Admin access required", 403));
  }
});

module.exports = { adminOnly };
