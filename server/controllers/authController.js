// authController.js
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const config = require("../config/envConfig");
const User = require("../models/User");
const Lesson = require("../models/Lesson");
const FlaggedContent = require("../models/FlaggedContent");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const authUtils = require("../utils/authUtils");
const { sendEmail, createPasswordResetEmail } = require("../utils/mailer");
const { sendJsonResponse } = require("../utils/responseHelpers");
const { trackLessonView } = require("../utils/streakManager");
const { validateEmail, validateUsername, validatePassword } = require("../utils/validationHelpers");

const register = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  // Validate input using validationHelpers
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    return next(new AppError(usernameValidation.message, 400));
  }

  if (!validateEmail(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return next(new AppError(passwordValidation.message, 400));
  }

  // Check for existing users
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
    authUtils.ACCESS_TOKEN_LIFESPAN,
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
    tokenLifespan,
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
      streak: newUser.streak,
    },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || user.isBlocked) {
    return next(
      new AppError("Invalid credentials or account is blocked.", 401),
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(
      new AppError("Invalid credentials or account is blocked.", 401),
    );
  }

  const streakResult = await trackLessonView(user);
  await user.save();

  const accessToken = authUtils.generateToken(
    { id: user._id, username: user.username, isAdmin: user.isAdmin },
    authUtils.getAccessTokenSecret(),
    authUtils.ACCESS_TOKEN_LIFESPAN,
  );

  const { tokenLifespan, cookieMaxAge } =
    authUtils.getRefreshTokenSettings(!!rememberMe);

  const refreshToken = authUtils.generateToken(
    {
      id: user._id,
      refreshTokenVersion: user.refreshTokenVersion,
      rememberMe: !!rememberMe,
    },
    authUtils.getRefreshTokenSecret(),
    tokenLifespan,
  );

  res.cookie("refreshToken", refreshToken, {
    ...authUtils.REFRESH_COOKIE_OPTIONS,
    maxAge: cookieMaxAge,
  });

  sendJsonResponse(res, 200, "Login successful", {
    accessToken,
    user: {
      id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
      streak: user.streak,
      lastActive: user.lastActiveDate,
    },
    streak: streakResult,
  });
});

const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.userId || req.user._id).select(
    "-password -refreshToken",
  );

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  sendJsonResponse(res, 200, "User profile fetched successfully.", {
    user,
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
      authUtils.getRefreshTokenSecret(),
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
      new AppError("Refresh token revoked. Please log in again.", 403),
    );
  }

  const streakResult = await trackLessonView(user);
  await user.save();

  const newAccessToken = authUtils.generateToken(
    {
      id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
    },
    authUtils.getAccessTokenSecret(),
    authUtils.ACCESS_TOKEN_LIFESPAN,
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
    tokenLifespan,
  );

  res.cookie("refreshToken", newRefreshToken, {
    ...authUtils.REFRESH_COOKIE_OPTIONS,
    maxAge: cookieMaxAge,
  });

  sendJsonResponse(res, 200, "Token refreshed successfully.", {
    accessToken: newAccessToken,
    user: {
      id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
      streak: user.streak,
      lastActive: user.lastActiveDate,
    },
    streak: streakResult,
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

const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // Validate email using validationHelpers
  if (!validateEmail(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  const user = await User.findOne({ email });

  const genericMessage =
    "If an account with that email exists, a password reset link has been sent.";

  if (!user) {
    if (config.isDevelopment()) {
      console.log(`Password reset attempted for non-existent email: ${email}`);
    }
    return sendJsonResponse(res, 200, genericMessage);
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpires = Date.now() + 3600000; // 1hr

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetTokenExpires;
  await user.save();

  const resetUrl = `${config.getFrontendUrl()}/reset-password/${resetToken}`;

  const emailContent = createPasswordResetEmail(resetUrl);

  const emailResult = await sendEmail(
    user.email,
    emailContent.subject,
    emailContent.html,
  );

  // In development, include preview info in response (optional)
  if (config.isDevelopment() && emailResult.previewUrl) {
    return sendJsonResponse(res, 200, genericMessage, {
      previewUrl: emailResult.previewUrl,
      resetToken: resetToken, // Only in development!
    });
  }

  sendJsonResponse(res, 200, genericMessage);
});

const validateResetToken = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError("Password reset token is invalid or has expired.", 400),
    );
  }
  sendJsonResponse(res, 200, "Token is valid.", { success: true });
});

const resetPassword = catchAsync(async (req, res, next) => {
  const { token, newPassword } = req.body;

  // Validate new password using validationHelpers
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    return next(new AppError(passwordValidation.message, 400));
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError("Password reset token is invalid or has expired.", 400),
    );
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
  await user.save();

  sendJsonResponse(res, 200, "Your password has been updated successfully.");
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
    { new: true, runValidators: true },
  ).select("username privacySettings");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  sendJsonResponse(res, 200, "Privacy settings updated successfully", {
    privacySettings: user.privacySettings,
  });
});

const createFlag = catchAsync(async (req, res, next) => {
  const { targetType, targetId, issueType, title, description, suggestedFix } =
    req.body;

  const validTargetTypes = ["LESSON", "EXERCISE", "QUIZ"];
  const validIssueTypes = [
    "CONTENT_ERROR",
    "CODE_ERROR",
    "QUIZ_ERROR",
    "BROKEN_FUNCTIONALITY",
    "XP_ADJUSTMENT",
    "OTHER",
  ];

  if (!validTargetTypes.includes(targetType)) {
    return next(new AppError("Invalid target type", 400));
  }

  if (!validIssueTypes.includes(issueType)) {
    return next(new AppError("Invalid issue type", 400));
  }

  if (!title || !description) {
    return next(new AppError("Title and description are required", 400));
  }

  let targetExists = false;
  if (targetType === "LESSON") {
    const lesson = await Lesson.findById(targetId);
    targetExists = !!lesson;
  } else if (targetType === "EXERCISE") {
    const lesson = await Lesson.findOne({ "exercise.id": targetId });
    targetExists = !!lesson;
  } else if (targetType === "QUIZ") {
    const lesson = await Lesson.findOne({ "quiz.id": targetId });
    targetExists = !!lesson;
  }

  if (!targetExists) {
    return next(new AppError("Target not found", 404));
  }

  const existingFlag = await FlaggedContent.findOne({
    targetType,
    targetId,
    reporterId: req.userId,
    issueType,
    status: { $in: ["PENDING", "IN_REVIEW"] },
  });

  if (existingFlag) {
    return next(
      new AppError(
        `You have already reported a ${issueType.replace(/_/g, " ").toLowerCase()} issue for this content. It is being reviewed.`,
        400,
      ),
    );
  }

  const flag = await FlaggedContent.create({
    targetType,
    targetId,
    reporterId: req.userId,
    issueType,
    title,
    description,
    suggestedFix,
    status: "PENDING",
  });

  console.log(`📝 New flag created: ${title} by user ${req.userId}`);

  sendJsonResponse(
    res,
    201,
    "Thank you for reporting! We will review this issue.",
    { flag },
  );
});

module.exports = {
  register,
  login,
  getUser,
  refreshToken,
  logout,
  forgotPassword,
  validateResetToken,
  resetPassword,
  updatePrivacySettings,
  createFlag,
};
