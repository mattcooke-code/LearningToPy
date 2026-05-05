// middleware/auth.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const authUtils = require("../utils/authUtils");
const catchAsync = require("../utils/catchAsync");

/**
 * Authentication middleware — protects routes by verifying JWT access tokens.
 *
 * **Flow:**
 * 1. Extracts Bearer token from Authorization header
 * 2. Verifies token signature and expiry
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
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(new AppError("Not authorized.", 401));
  }

  try {
    const decoded = jwt.verify(token, authUtils.getAccessTokenSecret());

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new AppError("User not found.", 401));
    }

    if (user.isBlocked) {
      return next(new AppError("User account is blocked.", 401));
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token.", 401));
    } else if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired.", 401));
    } else {
      return next(new AppError("Not authorized.", 401));
    }
  }
});
