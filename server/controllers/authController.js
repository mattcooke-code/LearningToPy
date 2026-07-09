// authController.js
// CONFIGURATION
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mongoose = require("mongoose");
const config = require("../config/envConfig");
// MODELS
const ActivityLog = require("../models/ActivityLog");
const AdminLog = require("../models/AdminLog");
const FlaggedContent = require("../models/FlaggedContent");
const Lesson = require("../models/Lesson");
const LessonCompletion = require("../models/LessonCompletion");
const LessonQuizProgress = require("../models/LessonQuizProgress");
const ModuleCompletion = require("../models/ModuleCompletion");
const QuizAttempt = require("../models/QuizAttempt");
const User = require("../models/User");
const XpTransaction = require("../models/XpTransaction");
// SERVICES
const { sendEmail } = require("../services/mailer");
const { trackLessonView } = require("../services/streakManager");
// UTILS
const AppError = require("../utils/AppError");
const authUtils = require("../utils/authUtils");
const catchAsync = require("../utils/catchAsync");
const emailTemplates = require("../utils/emailTemplates");
const { applyPepper } = require("../utils/pepper");
const { sendJsonResponse } = require("../utils/responseHelpers");
const userUtils = require("../utils/userUtils");
const {
  validateEmail,
  validateUsername,
  validatePassword,
} = require("../utils/validationHelpers");

/**
 * Register a new user account.
 *
 * Validates username, email, and password via validationHelpers.
 * Checks for existing email/username conflicts. Hashes password with bcrypt (12 rounds).
 * Generates access and refresh tokens, sets refresh token as httpOnly cookie.
 *
 * @route   POST /api/auth/register
 * @body    {string} username - Unique username
 * @body    {string} email - Valid email address
 * @body    {string} password - Must meet strength requirements (uppercase, lowercase, number, special char)
 * @returns {Object} 201 - { accessToken, user: { id, username, isAdmin, streak } }
 * @returns {Object} 400 - Validation error, duplicate email, or duplicate username
 */
const register = catchAsync(async (req, res, next) => {
  const { username, email, password, parentalConsent } = req.body;

  // Validate input using validationHelpers
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    return next(new AppError(usernameValidation.message, 400));
  }

  if (!validateEmail(email)) {
    return next(new AppError("Please provide a valid email address", 400));
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return next(new AppError(passwordValidation.message, 400));
  }

  // Age verification for UK compliance
  if (!req.body.dateOfBirth) {
    return next(new AppError("Date of birth is required", 400));
  }

  const birthDate = new Date(req.body.dateOfBirth);
  if (isNaN(birthDate.getTime())) {
    return next(new AppError("Invalid date of birth", 400));
  }

  const age = userUtils.calculateAge(birthDate);
  if (age < 13) {
    return next(
      new AppError(
        "You must be at least 13 years old to use this service.",
        400,
      ),
    );
  }

  if (age > 120) {
    return next(new AppError("Please enter a valid date of birth.", 400));
  }

  const compliance = userUtils.getAgeCompliancePackage(age, parentalConsent);
  const { ageBracket, privacySettings, ageNotice } = compliance;

  // Check for both simultaneously (Parallelized Execution)
  const [existingEmail, existingUsername] = await Promise.all([
    User.findOne({ email }),
    User.findOne({ username }),
  ]);

  if (existingEmail) return next(new AppError("Email already in use.", 400));
  if (existingUsername)
    return next(new AppError("Username already taken", 400));

  // Pepper Password
  const peppered = applyPepper(password);

  // Hash password
  const hashed = await bcrypt.hash(peppered, 12);

  // Create user ONCE with all required fields
  const newUser = await User.create({
    username,
    email,
    password: hashed,
    ageBracket,
    ageVerified: true,
    ageVerifiedAt: new Date(),
    privacySettings: privacySettings,
    parentalConsentConfirmed:
      ageBracket == "13-15" ? !!parentalConsent : undefined,
    refreshTokenVersion: 0,
  });

  // Generate tokens
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
    ...authUtils.getCookieOptions(),
    maxAge: cookieMaxAge,
  });

  // Privacy notice (GDPR transparency)
  const privacyNotice = {
    dataCollected: [
      "Username",
      "Email address",
      "Learning progress (XP, levels, completed lessons)",
      "Quiz and exercise results",
      "Activity timestamps",
    ],
    dataRetention:
      "Account data is retained until you delete your account. " +
      "Activity logs are automatically deleted after 90 days.",
    yourRights: [
      "Access your data (Settings > Export Data)",
      "Correct inaccurate data",
      "Delete your account and all data",
      "Object to data processing",
      "Data portability",
    ],
    contactEmail: "learning2py@gmail.com", // Update with your actual email
    lastUpdated: "2026-05-14",
  };

  sendJsonResponse(res, 201, "Signup successful.", {
    accessToken,
    user: {
      id: newUser._id,
      username: newUser.username,
      isAdmin: newUser.isAdmin,
      streak: newUser.streak,
      privacySettings: newUser.privacySettings,
    },
    ageNotice,
    privacyNotice,
  });
});

/**
 * Authenticate a user and return tokens.
 *
 * Verifies email/password against stored hash. Tracks a lesson view for streak
 * (login counts as activity). Supports "remember me" for extended refresh token lifespan.
 * Sets refresh token as httpOnly cookie.
 *
 * @route   POST /api/auth/login
 * @body    {string} email - User's email
 * @body    {string} password - User's password
 * @body    {boolean} [rememberMe] - Extend refresh token lifespan if true
 * @returns {Object} 200 - { accessToken, user, streak }
 * @returns {Object} 401 - Invalid credentials or account blocked
 */
const login = catchAsync(async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (user && user.leaderboardStatus === "INACTIVE_REMOVED") {
    user.leaderboardStatus =
      user.completedModulesCount >= 20 ? "COMPLETED_PENDING" : "ACTIVE";
    user.removedFromLeaderboardAt = null;
  }

  if (!user || user.isBlocked) {
    return next(
      new AppError("Invalid credentials or account is blocked.", 401),
    );
  }

  const peppered = applyPepper(password);

  const isMatch = await bcrypt.compare(peppered, user.password);
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
    ...authUtils.getCookieOptions(),
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

/**
 * Fetch the authenticated user's profile.
 *
 * Excludes password and refresh token fields from the response.
 *
 * @route   GET /api/auth/me
 * @returns {Object} 200 - { user }
 * @returns {Object} 404 - User not found
 */
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

/**
 * Refresh an expired access token using the refresh token cookie.
 *
 * Validates the refresh token, checks token version hasn't been revoked,
 * tracks streak activity, and issues a new access + refresh token pair.
 * Clears the cookie and returns 401/403 if the token is invalid, expired,
 * or the account is blocked.
 *
 * @route   POST /api/auth/refresh-token
 * @cookie  {string} refreshToken - httpOnly refresh token
 * @returns {Object} 200 - { accessToken, user, streak }
 * @returns {Object} 401 - No token, invalid token, or expired token
 * @returns {Object} 403 - Account blocked or token revoked
 */
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

  if (user && user.leaderboardStatus === "INACTIVE_REMOVED") {
    user.leaderboardStatus =
      user.completedModulesCount >= 20 ? "COMPLETED_PENDING" : "ACTIVE";
    user.removedFromLeaderboardAt = null;
  }

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
    ...authUtils.getCookieOptions(),
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

/**
 * Log out the current user.
 *
 * Increments `refreshTokenVersion` on the user document, which invalidates
 * all existing refresh tokens. Clears the refresh token cookie.
 *
 * @route   POST /api/auth/logout
 * @returns {Object} 200 - Confirmation message
 */
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

/**
 * Send a password reset email to the user.
 *
 * Generates a cryptographically secure reset token (32 bytes hex),
 * stores it on the user document with a 1-hour expiry, and sends
 * an email with a reset link. Returns a generic success message
 * regardless of whether the email exists (prevents user enumeration).
 *
 * In development, includes the reset token and preview URL in the response.
 *
 * @route   POST /api/auth/forgot-password
 * @body    {string} email - User's email address
 * @returns {Object} 200 - Generic success message (always)
 * @returns {Object} 400 - Invalid email format
 */
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // Validate email using validationHelpers
  if (!validateEmail(email)) {
    return next(new AppError("Please provide a valid email address", 400));
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

  const emailContent = emailTemplates.createPasswordResetEmail(resetUrl);

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

/**
 * Validate a password reset token.
 *
 * Checks that the token exists on a user document and hasn't expired.
 * Used by the frontend to determine whether to show the reset form.
 *
 * @route   GET /api/auth/reset-password/:token
 * @param   {string} token - Reset token from email link
 * @returns {Object} 200 - { success: true }
 * @returns {Object} 400 - Token invalid or expired
 */
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

/**
 * Set a new password using a valid reset token.
 *
 * Validates the new password strength, hashes it, clears the reset token fields,
 * and increments `refreshTokenVersion` to invalidate all existing sessions.
 *
 * @route   POST /api/auth/reset-password
 * @body    {string} token - Reset token from email link
 * @body    {string} newPassword - New password meeting strength requirements
 * @returns {Object} 200 - Success message
 * @returns {Object} 400 - Invalid token, expired token, or weak password
 */
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

  const peppered = applyPepper(newPassword);

  user.password = await bcrypt.hash(peppered, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
  await user.save();

  sendJsonResponse(res, 200, "Your password has been updated successfully.");
});

/**
 * Change password for authenticated user.
 * Requires current password verification before allowing change.
 * Increments refreshTokenVersion to invalidate all existing sessions.
 *
 * @route   POST /api/auth/change-password
 * @body    {string} currentPassword - User's current password
 * @body    {string} newPassword - Desired new password
 * @returns {Object} 200 - Success message
 * @returns {Object} 400 - Missing fields or weak password
 * @returns {Object} 401 - Current password incorrect
 */
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Validate inputs
  if (!currentPassword || !newPassword) {
    return next(
      new AppError("Please provide both current and new password.", 400),
    );
  }

  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    return next(new AppError(passwordValidation.message, 400));
  }

  // Get user with password field
  const user = await User.findById(req.user._id || req.userId).select(
    "+password",
  );

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  // Verify current password
  const pepperedCurrent = applyPepper(currentPassword);
  const isMatch = await bcrypt.compare(pepperedCurrent, user.password);
  if (!isMatch) {
    return next(new AppError("Current password is incorrect.", 401));
  }

  // Hash and save new password
  const pepperedNew = applyPepper(newPassword);
  user.password = await bcrypt.hash(pepperedNew, 12);

  // Invalidate all existing sessions (security best practice)
  user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;

  await user.save();

  // Clear existing refresh token and issue new one
  authUtils.clearRefreshTokenCookie(res);

  const accessToken = authUtils.generateToken(
    { id: user._id, username: user.username, isAdmin: user.isAdmin },
    authUtils.getAccessTokenSecret(),
    authUtils.ACCESS_TOKEN_LIFESPAN,
  );

  const { tokenLifespan, cookieMaxAge } =
    authUtils.getRefreshTokenSettings(false);

  const refreshToken = authUtils.generateToken(
    {
      id: user._id,
      refreshTokenVersion: user.refreshTokenVersion,
      rememberMe: false,
    },
    authUtils.getRefreshTokenSecret(),
    tokenLifespan,
  );

  res.cookie("refreshToken", refreshToken, {
    ...authUtils.getCookieOptions(),
    maxAge: cookieMaxAge,
  });

  sendJsonResponse(
    res,
    200,
    "Password changed successfully. You remain logged in.",
    {
      accessToken,
    },
  );
});

/**
 * Delete user account and all associated data.
 *
 * Your data model stores most user data embedded in the User document,
 * so deleting the user automatically removes:
 *   - completedLessons, completedModules, quizAttempts
 *   - xpHistory, badges, stats, streaks
 *   - privacySettings, lessonQuizProgress
 *
 * Separate collections that need explicit cleanup:
 *   - ActivityLog (analytics)
 *   - FlaggedContent (user's reports)
 *
 * @route   DELETE /api/auth/delete-account
 * @body    {string} password - Current password for confirmation
 * @returns {Object} 200 - Success message
 */
const deleteAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(
      new AppError("Please provide your password to confirm deletion.", 400),
    );
  }

  const user = await User.findById(req.user._id || req.userId).select(
    "+password",
  );

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  const peppered = applyPepper(password);
  const isMatch = await bcrypt.compare(peppered, user.password);
  if (!isMatch) {
    return next(
      new AppError("Password is incorrect. Account not deleted.", 401),
    );
  }

  const userId = user._id;

  // Use transactions only in production (Atlas supports replica sets)
  // In development, run sequentially without transaction guarantees
  if (config.isProduction()) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      await User.findByIdAndDelete(userId).session(session);
      await Promise.all([
        ActivityLog.deleteMany({ userId }).session(session),
        FlaggedContent.deleteMany({ reporterId: userId }).session(session),
        LessonCompletion.deleteMany({ userId }).session(session),
        ModuleCompletion.deleteMany({ userId }).session(session),
        QuizAttempt.deleteMany({ userId }).session(session),
        XpTransaction.deleteMany({ userId }).session(session),
        LessonQuizProgress.deleteMany({ userId }).session(session),
      ]);
      await AdminLog.updateMany(
        { adminId: userId },
        {
          $set: {
            adminId: null,
            changes: { note: "Admin account deleted" },
          },
        },
      ).session(session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } else {
    // Development: run without transactions
    await User.findByIdAndDelete(userId);
    await Promise.all([
      ActivityLog.deleteMany({ userId }),
      FlaggedContent.deleteMany({ reporterId: userId }),
      LessonCompletion.deleteMany({ userId }),
      ModuleCompletion.deleteMany({ userId }),
      QuizAttempt.deleteMany({ userId }),
      XpTransaction.deleteMany({ userId }),
      LessonQuizProgress.deleteMany({ userId }),
    ]);
    await AdminLog.updateMany(
      { adminId: userId },
      {
        $set: {
          adminId: null,
          changes: { note: "Admin account deleted" },
        },
      },
    );
  }

  authUtils.clearRefreshTokenCookie(res);
  sendJsonResponse(res, 200, "Account permanently deleted.");
});

/**
 * Update the user's privacy settings.
 *
 * Accepts three boolean fields: showOnLeaderboards, showAsAnonymous,
 * showUsernameOnLeaderboards. All three are required.
 *
 * @route   PUT /api/auth/privacy
 * @body    {boolean} showOnLeaderboards - Appear on leaderboards
 * @body    {boolean} showAsAnonymous - Hide identity
 * @body    {boolean} showUsernameOnLeaderboards - Show username vs "Learner #XXXXXX"
 * @returns {Object} 200 - { privacySettings }
 * @returns {Object} 400 - Invalid format (non-boolean values)
 * @returns {Object} 404 - User not found
 */
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

  const existingUser = await User.findById(userId).select("+ageBracket");

  if (!existingUser) {
    return next(new AppError("User not found", 404));
  }

  let finalSettings;
  if (existingUser.ageBracket === "13-15") {
    finalSettings = {
      showOnLeaderboards: false,
      showAsAnonymous: true,
      showUsernameOnLeaderboards: false,
    };
  } else {
    finalSettings = {
      showOnLeaderboards,
      showAsAnonymous,
      showUsernameOnLeaderboards,
    };
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        "privacySettings.showOnLeaderboards": finalSettings.showOnLeaderboards,
        "privacySettings.showAsAnonymous": finalSettings.showAsAnonymous,
        "privacySettings.showUsernameOnLeaderboards":
          finalSettings.showUsernameOnLeaderboards,
      },
    },
    { new: true, runValidators: true },
  ).select("username privacySettings");

  sendJsonResponse(res, 200, "Privacy settings updated successfully", {
    privacySettings: user.privacySettings,
  });
});

/**
 * Flag content for admin review.
 *
 * Supports flagging LESSON, EXERCISE, or QUIZ targets. Validates that the
 * target exists, prevents duplicate pending flags from the same user on
 * the same target, and creates a FlaggedContent record.
 *
 * @route   POST /api/auth/flag
 * @body    {string} targetType - "LESSON" | "EXERCISE" | "QUIZ"
 * @body    {string} targetId - ID of the flagged content
 * @body    {string} issueType - One of: CONTENT_ERROR, CODE_ERROR, QUIZ_ERROR, BROKEN_FUNCTIONALITY, XP_ADJUSTMENT, OTHER
 * @body    {string} title - Brief flag title
 * @body    {string} description - Detailed description of the issue
 * @body    {string} [suggestedFix] - Optional suggested correction
 * @returns {Object} 201 - { flag }
 * @returns {Object} 400 - Invalid target type, issue type, missing title/description, or duplicate flag
 * @returns {Object} 404 - Target not found
 */
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

/**
 * Export all user data (GDPR Right of Access).
 * Returns a JSON object containing all data held about the user.
 *
 * @route   GET /api/auth/export-data
 * @returns {Object} 200 - Complete user data export
 */
const exportUserData = catchAsync(async (req, res, next) => {
  const userId = req.user._id || req.userId;

  const user = await User.findById(userId)
    .select(
      "-password -refreshTokenVersion -resetPasswordToken -resetPasswordExpires",
    )
    .lean();

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  // Fetch all associated data from separate collections
  const [
    activityLogs,
    flaggedContent,
    lessonCompletions,
    moduleCompletions,
    quizAttempts,
    xpTransactions,
    lessonQuizProgress,
  ] = await Promise.all([
    ActivityLog.find({ userId }).select("-ipAddress").lean(),
    FlaggedContent.find({ reporterId: userId }).lean(),
    LessonCompletion.find({ userId }).sort({ completedAt: -1 }).lean(),
    ModuleCompletion.find({ userId }).sort({ completedAt: -1 }).lean(),
    QuizAttempt.find({ userId }).sort({ attemptedAt: -1 }).lean(),
    XpTransaction.find({ userId }).sort({ awardedAt: -1 }).lean(),
    LessonQuizProgress.find({ userId }).lean(),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: {
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      ageVerified: user.ageVerified,
      ageVerifiedAt: user.ageVerifiedAt,
      ageBracket: user.ageBracket,
      parentalConsentConfirmed: user.parentalConsentConfirmed,
      dataRetentionNote:
        "Age verification performed at registration. Date of birth is not stored. " +
        "Age bracket is retained for legal compliance under GDPR and UK Children's Code.",

      // Progress (counters)
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      completedLessonsCount: user.completedLessonsCount,
      completedModulesCount: user.completedModulesCount,
      badges: user.badges,
      stats: user.stats,

      // Privacy
      privacySettings: user.privacySettings,
    },
    lessonCompletions: {
      count: lessonCompletions.length,
      data: lessonCompletions,
    },
    moduleCompletions: {
      count: moduleCompletions.length,
      data: moduleCompletions,
    },
    quizAttempts: {
      count: quizAttempts.length,
      data: quizAttempts,
    },
    xpHistory: {
      count: xpTransactions.length,
      data: xpTransactions,
    },
    lessonQuizProgress: {
      count: lessonQuizProgress.length,
      data: lessonQuizProgress,
    },
    activityLogs: {
      count: activityLogs.length,
      data: activityLogs,
      note: "IP addresses have been removed for privacy. Activity logs auto-delete after 90 days.",
    },
    flaggedContent: {
      count: flaggedContent.length,
      data: flaggedContent,
    },
  };

  sendJsonResponse(res, 200, "Data export successful.", exportData);
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
  changePassword,
  deleteAccount,
  updatePrivacySettings,
  createFlag,
  exportUserData,
};
