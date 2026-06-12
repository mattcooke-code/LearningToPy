const AppError = require("../utils/AppError");

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Authentication required", 401));
  }
  if (req.user.isBlocked) {
    return next(new AppError("Your account has been blocked", 403));
  }
  if (!req.user.isAdmin) {
    return next(new AppError("Admin access required", 403));
  }
  next();
};

module.exports = { adminOnly };
