// middleware/auth.js
const User = require("../models/User");
const AppError = require("../utils/AppError");
const authUtils = require("../utils/authUtils");
const catchAsync = require("../utils/catchAsync");

/**
 * Authentication middleware — protects routes by verifying JWT access tokens.
 *
 * **Flow:**
 * 1. Extracts Bearer token from Authorization header
 * 2. Verifies token signature and expiry via authUtils
 * 3. Looks up user in database (excludes password field)
 * 4. Checks if user account is blocked
 * 5. Attaches `req.user` and `req.userId` for downstream handlers
 *
 * **Error responses:**
 * - 401: No token provided, invalid token, expired token, or user not found/blocked
 *
 * @middleware Applied via `router.use(protect)` on protected route groups
 */
const protect = catchAsync(async (req, res, next) => {
  const token = req.headers["authorization"]?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return next(new AppError("Not authorized.", 401));
  }

  let decoded;
  try {
    decoded = authUtils.verifyToken(token, authUtils.getAccessTokenSecret());
  } catch (error) {
    return next(error);
  }

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    return next(new AppError("User not found.", 401));
  }

  if (user.isBlocked) {
    return next(new AppError("User account is blocked.", 401));
  }

  req.user = user;
  req.userId = user._id;
  next();
});

module.exports = { protect };
