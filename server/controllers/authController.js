// authController.js
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const authUtils = require("../utils/authUtils");
const { sendJsonResponse } = require("../utils/responseHelpers");

// Signup Function
const register = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return next(new AppError("Email already in use.", 400));
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    return next(new AppError("Username already taken", 400));
  }

  const hashed = await bcrypt.hash(password, 12);

  const newUser = await User.create({ username, email, password: hashed });
  const refreshTokenString = authUtils.generateRefreshTokenString();

  // Generate token
  const accessToken = authUtils.generateToken(
    {
      id: newUser._id,
      isAdmin: newUser.isAdmin,
    },
    authUtils.tokenTypes.ACCESS,
    authUtils.getTokenExpiration(authUtils.tokenTypes.ACCESS)
  );

  const refreshTokenExpires = new Date(
    Date.now() + authUtils.getTokenLifespanMs(authUtils.tokenTypes.REFRESH)
  );

  newUser.refreshTokens.push({
    token: refreshTokenString,
    expiresAt: refreshTokenExpires,
  });

  await newUser.save();

  sendJsonResponse(res, 201, "Signup successful.", {
    accessToken,
    user: {
      id: newUser._id,
      username: newUser.username,
      isAdmin: newUser.isAdmin,
    },
    refreshToken: refreshTokenString,
  });
});

// Login Function
const login = catchAsync(async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || user.isBlocked) {
    return next(
      new AppError("Invalid credentials or account is blocked.", 401)
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(
      new AppError("Invalid credentials or account is blocked.", 401)
    );
  }

  const refreshTokenString = authUtils.generateRefreshTokenString();

  // Generate token
  const accessToken = authUtils.generateToken(
    { id: user._id, isAdmin: user.isAdmin },
    authUtils.tokenTypes.ACCESS,
    authUtils.getTokenExpiration(authUtils.tokenTypes.ACCESS)
  );

  const refreshTokenExpires = new Date(
    Date.now() +
      (rememberMe
        ? authUtils.getTokenLifespanMs(authUtils.tokenTypes.REMEMBER_ME)
        : authUtils.getTokenLifespanMs(authUtils.tokenTypes.REFRESH))
  );

  user.refreshTokens.push({
    token: refreshTokenString,
    expiresAt: refreshTokenExpires,
  });

  await user.save();

  sendJsonResponse(res, 200, "Login successful", {
    accessToken,
    user: { id: user._id, username: user.username, isAdmin: user.isAdmin },
    refreshToken: refreshTokenString,
  });
});

const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  sendJsonResponse(res, 200, "User profile fetched successfully.", {
    user: user,
  });
});

const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError("Refresh token is required.", 400));
  }

  const user = await User.findOne({ "refreshTokens.token": refreshToken });

  try {
    authUtils.verifyRefreshToken(refreshToken, user);

    const accessToken = authUtils.generateToken(
      { id: user._id, isAdmin: user.isAdmin },
      authUtils.tokenTypes.ACCESS
    );

    sendJsonResponse(res, 200, "Token refreshed successfully.", {
      accessToken,
      user: { id: user._id, username: user.username, isAdmin: user.isAdmin },
    });
  } catch (error) {
    return next(new AppError("Invalid or expired refresh token.", 401));
  }
});

const logout = catchAsync(async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return next(new AppError("User not found.", 400));
  }

  user.refreshTokens = [];

  await user.save();

  return sendJsonResponse(res, 200, "Logged out successfully.");
});

// EXPORT
module.exports = {
  register,
  login,
  getMe,
  refreshToken,
  logout,
};
