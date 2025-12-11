// middleware/adminOnly.js
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

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

// Export as object
module.exports = { adminOnly };
