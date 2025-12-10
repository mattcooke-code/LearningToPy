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

  const newUser = await User.create({
    username,
    email,
    password: hashed,
    refreshTokenVersion: 0,
  });

  const accessToken = authUtils.generateToken(
    {
      id: newUser._id,
      username: newUser.username,
      isAdmin: newUser.isAdmin,
    },
    authUtils.getAccessTokenSecret(),
    authUtils.ACCESS_TOKEN_LIFESPAN
  );

  const { tokenLifespan, cookieMaxAge } =
    authUtils.getRefreshTokenSettings(false);

  const refreshToken = authUtils.generateToken(
    {
      id: newUser._id,
      refreshTokenVersion: newUser.refreshTokenVersion,
      rememberMe: false,
    },
    authUtils.getRefreshTokenSecret(),
    tokenLifespan
  );

  res.cookie("refreshToken", refreshToken, {
    ...authUtils.REFRESH_COOKIE_OPTIONS,
    maxAge: cookieMaxAge,
  });

  sendJsonResponse(res, 201, "Signup successful.", {
    accessToken,
    user: {
      id: newUser._id,
      username: newUser.username,
      isAdmin: newUser.isAdmin,
    },
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

  const accessToken = authUtils.generateToken(
    { id: user._id, username: user.username, isAdmin: user.isAdmin },
    authUtils.getAccessTokenSecret(),
    authUtils.ACCESS_TOKEN_LIFESPAN
  );

  const { tokenLifespan, cookieMaxAge } = authUtils.getRefreshTokenSettings(
    !!rememberMe
  );

  const refreshToken = authUtils.generateToken(
    {
      id: user._id,
      refreshTokenVersion: user.refreshTokenVersion,
      rememberMe: !!rememberMe,
    },
    authUtils.getRefreshTokenSecret(),
    tokenLifespan
  );

  res.cookie("refreshToken", refreshToken, {
    ...authUtils.REFRESH_COOKIE_OPTIONS,
    maxAge: cookieMaxAge,
  });

  sendJsonResponse(res, 200, "Login successful", {
    accessToken,
    user: { id: user._id, username: user.username, isAdmin: user.isAdmin },
  });
});

const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  sendJsonResponse(res, 200, "User profile fetched successfully.", {
    user: user,
  });
});

const refreshToken = catchAsync(async (req, res, next) => {
  const refreshTokenCookie = req.cookies.refreshToken;

  if (!refreshTokenCookie) {
    authUtils.clearRefreshTokenCookie(res);
    return next(new AppError("No refresh token provided.", 401));
  }

  let decoded;
  try {
    decoded = authUtils.verifyToken(
      refreshTokenCookie,
      authUtils.getRefreshTokenSecret()
    );
  } catch (error) {
    authUtils.clearRefreshTokenCookie(res);
    return next(new AppError("Invalid or expired refresh token.", 401));
  }

  const user = await User.findById(decoded.id);

  if (!user || user.isBlocked) {
    authUtils.clearRefreshTokenCookie(res);
    return next(new AppError("Invalid account or account is blocked.", 403));
  }

  if (decoded.refreshTokenVersion !== user.refreshTokenVersion) {
    authUtils.clearRefreshTokenCookie(res);
    return next(
      new AppError("Refresh token revoked. Please log in again.", 403)
    );
  }

  const newAccessToken = authUtils.generateToken(
    {
      id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
    },
    authUtils.getAccessTokenSecret(),
    authUtils.ACCESS_TOKEN_LIFESPAN
  );

  const isRememberMeToken = decoded.rememberMe;
  const { tokenLifespan, cookieMaxAge } =
    authUtils.getRefreshTokenSettings(isRememberMeToken);

  const newRefreshToken = authUtils.generateToken(
    {
      id: user._id,
      refreshTokenVersion: user.refreshTokenVersion,
      rememberMe: isRememberMeToken,
    },
    authUtils.getRefreshTokenSecret(),
    tokenLifespan
  );

  res.cookie("refreshToken", newRefreshToken, {
    ...authUtils.REFRESH_COOKIE_OPTIONS,
    maxAge: cookieMaxAge,
  });

  sendJsonResponse(res, 200, "Token refreshed successfully.", {
    accessToken: newAccessToken,
    user: { id: user._id, username: user.username, isAdmin: user.isAdmin },
  });
});

const logout = catchAsync(async (req, res, next) => {
  authUtils.clearRefreshTokenCookie(res);

  if (req.user) {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
      await user.save();
    }
  }

  return sendJsonResponse(res, 200, "Logged out successfully.");
});

const updatePrivacySettings = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const { showOnLeaderboards, showAsAnonymous, showUsernameOnLeaderboards } =
    req.body;

  if (
    typeof showOnLeaderboards !== "boolean" ||
    typeof showAsAnonymous !== "boolean" ||
    typeof showUsernameOnLeaderboards !== "boolean"
  ) {
    return next(new AppError("Invalid privacy settings format", 400));
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        "privacySettings.showOnLeaderboards": showOnLeaderboards,
        "privacySettings.showAsAnonymous": showAsAnonymous,
        "privacySettings.showUsernameOnLeaderboards":
          showUsernameOnLeaderboards,
      },
    },
    { new: true, runValidators: true }
  ).select("username privacySettings");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  sendJsonResponse(res, 200, "Privacy settings updated successfully", {
    data: { privacySettings: user.privacySettings },
  });
});

// EXPORT
module.exports = {
  register,
  login,
  getUser,
  refreshToken,
  logout,
  updatePrivacySettings,
};
