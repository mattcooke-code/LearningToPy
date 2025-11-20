// middleware/auth.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const authUtils = require("../utils/authUtils");
const catchAsync = require("../utils/catchAsync");

const protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("🔐 No token provided");
    return next(new AppError("Not authorized.", 401));
  }

  try {
    console.log("🔐 Verifying token...");
    const decoded = jwt.verify(token, authUtils.getAccessTokenSecret());
    console.log("🔐 Token decoded for user ID:", decoded.id);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("🔐 User not found for ID:", decoded.id);
      return next(new AppError("User not found.", 401));
    }

    // Check if user is blocked
    if (user.isBlocked) {
      console.log("🔐 User is blocked:", user.username);
      return next(new AppError("User account is blocked.", 401));
    }

    console.log("🔐 User authorized:", user.username);
    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    console.error("🔐 Token verification failed:", error.message);

    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token.", 401));
    } else if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired.", 401));
    } else {
      return next(new AppError("Not authorized.", 401));
    }
  }
});

module.exports = { protect };
