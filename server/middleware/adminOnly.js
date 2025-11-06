// adminOnly.js
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const adminOnly = catchAsync(async (req, res, next) => {
  if (req.user && req.user.isAdmin === true) {
    next();
  } else {
    return next(new AppError("Admin access required.", 403));
  }
});

module.exports = { adminOnly };
