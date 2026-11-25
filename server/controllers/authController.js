// authController.js
// MODELS
const User = require("../models/User");
// SERVICES
const authService = require("../services/authService");
const { trackDailyActivity } = require("../services/streakManager");
// UTILITIES & CONSTANTS
const authConstants = require("../constants/authConstants");
const AppError = require("../utils/AppError");
const authUtils = require("../utils/authUtils");
const catchAsync = require("../utils/catchAsync");
const { PRIVACY_NOTICE } = require("../utils/privacyUtils");
const { sendJsonResponse } = require("../utils/responseHelpers");

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account. Delegates validation and creation to authService.
 * @access  Public
 * @body    {string} username - Unique username
 * @body    {string} email - Valid email address
 * @body    {string} password - Must meet strength requirements
 * @body    {string} dateOfBirth - ISO date string
 * @body    {boolean} [parentalConsent] - Required if under 16
 * @returns {201} { accessToken, user, streak, ageNotice, privacyNotice }
 * @returns {400} Validation error, duplicate email/username, or age restriction
 */
const register = catchAsync(async (req, res, next) => {
  const { user, ageNotice, streak } = await authService.registerUser(req.body);
  const accessToken = authUtils.issueTokenPair(res, user, false);

  sendJsonResponse(res, 201, "Signup successful.", {
    accessToken,
    user: { ...authUtils.toAuthUser(user) },
    streak,
    ageNotice,
    privacyNotice: PRIVACY_NOTICE,
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate a user. Delegates credential verification to authService.
 * @access  Public
 * @body    {string} credential - Email or username
 * @body    {string} password - User's password
 * @body    {boolean} [rememberMe] - Extend refresh token lifespan
 * @body    {string} [userLocalDate] - ISO date string for streak tracking
 * @returns {200} { accessToken, user, streak }
 * @returns {401} Invalid credentials or account blocked
 */
const login = catchAsync(async (req, res, next) => {
  const { rememberMe } = req.body;
  const { user, streak } = await authService.authenticateUser(req.body);

  const accessToken = authUtils.issueTokenPair(res, user, !!rememberMe);

  sendJsonResponse(res, 200, "Login successful", {
    accessToken,
    user: authUtils.toAuthUser(user),
    streak,
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Fetch the authenticated user's profile.
 * @access  Private
 * @returns {200} { user }
 * @returns {404} User not found
 */
const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken -resetPasswordToken -resetPasswordExpires +ageBracket",
  );

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  sendJsonResponse(res, 200, "User profile fetched successfully.", { user });
});

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh an expired access token. Delegates token rotation to authService.
 * @access  Public (requires refreshToken cookie)
 * @cookie  {string} refreshToken - httpOnly refresh token
 * @body    {string} [userLocalDate] - ISO date string for streak tracking
 * @returns {200} { accessToken, user, streak }
 * @returns {401} No token, invalid token, or expired token
 * @returns {403} Account blocked or token revoked
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

  let userAndStreak;
  try {
    userAndStreak = await authService.rotateRefreshToken(
      decoded,
      req.body.userLocalDate,
    );
  } catch (err) {
    authUtils.clearRefreshTokenCookie(res);
    return next(err);
  }

  const { user, streak } = userAndStreak;

  const accessToken = authUtils.issueTokenPair(res, user, decoded.rememberMe);

  sendJsonResponse(res, 200, "Token refreshed successfully.", {
    accessToken,
    user: authUtils.toAuthUser(user),
    streak,
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Log out the current user. Delegates session revocation to authService.
 * @access  Private (Fallback to refresh token if access token is expired)
 * @returns {200} Confirmation message
 */
const logout = catchAsync(async (req, res, next) => {
  authUtils.clearRefreshTokenCookie(res);
  let userId = req.user?._id;

  // Fallback if access token is expired, decode refresh token to find user
  if (!userId && req.cookies.refreshToken) {
    try {
      const decoded = authUtils.verifyToken(
        req.cookies.refreshToken,
        authUtils.getRefreshTokenSecret(),
      );
      userId = decoded.id;
    } catch (err) {
      // Token already expired/invalid
    }
  }

  await authService.revokeUserSessions(userId);
  return sendJsonResponse(res, 200, "Logged out successfully.");
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send a password reset email. Delegates token generation to authService.
 * @access  Public
 * @body    {string} email - User's email address
 * @returns {200} Generic success message (always, to prevent user enumeration)
 * @returns {400} Invalid email format
 */
const forgotPassword = catchAsync(async (req, res, next) => {
  const { message, preview } = await authService.createPasswordReset(
    req.body.email,
  );
  sendJsonResponse(res, 200, message, preview || undefined);
});

/**
 * @route   GET /api/auth/reset-password/:token
 * @desc    Validate a password reset token.
 * @access  Public
 * @param   {string} token - Reset token from email link
 * @returns {200} { success: true }
 * @returns {400} Token invalid or expired
 */
const validateResetToken = catchAsync(async (req, res, next) => {
  await authService.findValidResetUser(req.params.token);
  sendJsonResponse(res, 200, "Token is valid.", { success: true });
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Set a new password using a valid reset token.
 * @access  Public
 * @body    {string} token - Reset token from email link
 * @body    {string} newPassword - New password meeting strength requirements
 * @returns {200} Success message
 * @returns {400} Invalid token, expired token, or weak password
 */
const resetPassword = catchAsync(async (req, res, next) => {
  await authService.resetPasswordWithToken(req.body);
  sendJsonResponse(res, 200, "Your password has been updated successfully.");
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password for authenticated user.
 * @access  Private
 * @body    {string} currentPassword - User's current password
 * @body    {string} newPassword - Desired new password
 * @returns {200} { accessToken } - Fresh token pair (previous sessions revoked)
 * @returns {400} Missing fields or weak password
 * @returns {401} Current password incorrect
 */
const changePassword = catchAsync(async (req, res, next) => {
  const user = await authService.changeUserPassword(req.user._id, req.body);

  authUtils.clearRefreshTokenCookie(res);
  const accessToken = authUtils.issueTokenPair(res, user, false);

  sendJsonResponse(
    res,
    200,
    "Password changed successfully. You remain logged in.",
    { accessToken },
  );
});

/**
 * @route   DELETE /api/auth/delete-account
 * @desc    Delete user account and all associated data.
 * @access  Private
 * @body    {string} password - Current password for confirmation
 * @returns {200} Success message
 */
const deleteAccount = catchAsync(async (req, res, next) => {
  await authService.deleteUserAccount(req.user._id, req.body.password);

  authUtils.clearRefreshTokenCookie(res);
  sendJsonResponse(res, 200, "Account permanently deleted.");
});

/**
 * @route   PUT /api/auth/privacy
 * @desc    Update the user's privacy settings.
 * @access  Private
 * @body    {boolean} showOnLeaderboards
 * @body    {boolean} showAsAnonymous
 * @body    {boolean} showUsernameOnLeaderboards
 * @returns {200} { privacySettings }
 * @returns {400} Invalid format (non-boolean values)
 * @returns {404} User not found
 */
const updatePrivacySettings = catchAsync(async (req, res, next) => {
  const privacySettings = await authService.updateUserPrivacySettings(
    req.user._id,
    req.body,
  );
  sendJsonResponse(res, 200, "Privacy settings updated successfully", {
    privacySettings,
  });
});

/**
 * @route   POST /api/auth/flag
 * @desc    Flag content for admin review.
 * @access  Private
 * @body    {string} targetType - "LESSON" | "EXERCISE" | "QUIZ"
 * @body    {string} targetId - ID of the flagged content
 * @body    {string} issueType - Enum from authConstants
 * @body    {string} title
 * @body    {string} description
 * @body    {string} [suggestedFix]
 * @returns {201} { flag }
 * @returns {400} Invalid type, missing fields, or duplicate flag
 * @returns {404} Target not found
 */
const createFlag = catchAsync(async (req, res, next) => {
  const flag = await authService.createContentFlag(req.user._id, req.body);
  console.log(`📝 New flag created: ${flag.title} by user ${req.user._id}`);

  sendJsonResponse(
    res,
    201,
    "Thank you for reporting! We will review this issue.",
    { flag },
  );
});

/**
 * @route   GET /api/auth/export-data
 * @desc    Export all user data (GDPR Right of Access).
 * @access  Private
 * @returns {200} Complete user data export
 */
const exportUserData = catchAsync(async (req, res, next) => {
  const exportData = await authService.exportUserDataFor(req.user._id);
  sendJsonResponse(res, 200, "Data export successful.", exportData);
});

/**
 * @route   PATCH /api/auth/cookie-consent
 * @desc    Update user's cookie consent preferences.
 * @access  Private
 * @body    {string} cookieConsent - "ACCEPTED" or "DECLINED"
 * @body    {string} [cookieConsentDate] - ISO date string of consent
 * @returns {200} { cookieConsent, cookieConsentDate }
 * @returns {400} Invalid consent value
 */
const updateCookieConsent = catchAsync(async (req, res, next) => {
  const { cookieConsent } = req.body;

  if (!authConstants.COOKIE_CONSENT_VALUES.includes(cookieConsent)) {
    return next(
      new AppError("Invalid consent value. Must be ACCEPTED or DECLINED.", 400),
    );
  }

  const result = await authService.updateUserCookieConsent(
    req.user._id,
    req.body,
  );
  sendJsonResponse(res, 200, "Cookie preferences updated.", result);
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
  updateCookieConsent,
};
