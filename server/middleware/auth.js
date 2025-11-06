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
    return next(new AppError("Not authorized.", 401));
  }

  const decoded = jwt.verify(token, authUtils.getAccessTokenSecret());

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    return next(new AppError("User not found.", 401));
  }

  req.user = user;
  next();
});

module.exports = { protect };
