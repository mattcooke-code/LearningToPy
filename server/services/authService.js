// services/authService.js
// ─────────────── IMPORTS ──────────────────
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
const Session = require("../models/Session");
const User = require("../models/User");
const XpTransaction = require("../models/XpTransaction");

// SERVICES
const { sendEmail } = require("./mailer");
const { trackDailyActivity } = require("./streakManager");

// UTILITIES & CONSTANTS
const AppError = require("../utils/AppError");
const emailTemplates = require("../utils/emailTemplates");
const pepper = require("../utils/pepper");
const userUtils = require("../utils/userUtils");
const validationHelper = require("../utils/validationHelpers");
const authConstants = require("../constants/authConstants");

// +=============================================+
// |              SHARED HELPERS                 |
// +=============================================+
/**
 * Verify a plaintext password against a stored hash.
 * Applies the application pepper before comparison.
 * @param {string} plainPassword - User-supplied plaintext
 * @param {string} hashedPassword - Stored bcrypt hash
 * @returns {Promise<boolean>} true if the password matches
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(pepper.applyPepper(plainPassword), hashedPassword);
};

/**
 * Hash a plaintext password with the application pepper.
 * @param {string} plainPassword
 * @returns {Promise<string>} bcrypt hash
 */
const hashPassword = async (plainPassword) => {
  return bcrypt.hash(pepper.applyPepper(plainPassword), 12);
};

// +=============================================+
// |              AUTHENTICATION                 |
// +=============================================+

/**
 * Registers a new user account.
 * @async
 * @param {Object} userData - The registration payload.
 * @returns {Promise<{user: Object, ageNotice: string}>} The created user and age notice.
 * @throws {AppError} 400 if validation fails or user exists.
 */
const registerUser = async ({
  username,
  email,
  password,
  parentalConsent,
  dateOfBirth,
}) => {
  const usernameValidation = validationHelper.validateUsername(username);
  if (!usernameValidation.isValid)
    throw new AppError(usernameValidation.message, 400);
  if (!validationHelper.validateEmail(email))
    throw new AppError("Please provide a valid email address", 400);

  const passwordValidation = validationHelper.validatePassword(password);
  if (!passwordValidation.isValid)
    throw new AppError(passwordValidation.message, 400);
  if (!dateOfBirth) throw new AppError("Date of birth is required", 400);

  const birthDate = new Date(dateOfBirth);
  if (isNaN(birthDate.getTime()))
    throw new AppError("Invalid date of birth", 400);

  const age = userUtils.calculateAge(birthDate);
  if (age < authConstants.MIN_AGE)
    throw new AppError(
      `You must be at least ${authConstants.MIN_AGE} years old to use this service.`,
      400,
    );
  if (age > authConstants.MAX_AGE)
    throw new AppError("Please enter a valid date of birth.", 400);

  const { ageBracket, privacySettings, ageNotice } =
    userUtils.getAgeCompliancePackage(age, parentalConsent);

  const [existingEmail, existingUsername] = await Promise.all([
    User.findOne({ email }),
    User.findOne({ username }),
  ]);

  if (existingEmail) throw new AppError("Email already in use", 400);
  if (existingUsername) throw new AppError("Username already taken", 400);

  const hashed = await hashPassword(password);
  const newUser = await User.create({
    username,
    email,
    password: hashed,
    ageBracket,
    ageVerified: true,
    ageVerifiedAt: new Date(),
    privacySettings,
    parentalConsentConfirmed:
      ageBracket === authConstants.RESTRICTED_AGE_BRACKET
        ? !!parentalConsent
        : undefined,
    refreshTokenVersion: 0,
  });

  return { user: newUser, ageNotice };
};

/**
 * Authenticates a user and tracks daily streak activity.
 * @async
 * @param {Object} credentials - Login payload.
 * @param {string} [credentials.userLocalDate] - ISO date string for streak tracking.
 * @returns {Promise<{user: Object, streak: Object}>} The authenticated user and streak data.
 * @throws {AppError} 401 if credentials are invalid or account is blocked.
 */
const authenticateUser = async ({
  credential,
  email,
  password,
  userLocalDate,
}) => {
  const loginIdentifier = credential || email;
  if (!loginIdentifier || !password)
    throw new AppError("Please provide credentials and password", 400);

  const user = await User.findByCredential(loginIdentifier);
  if (user) userUtils.reconcileLeaderboardStatus(user);
  if (!user || user.isBlocked)
    throw new AppError("Invalid credentials or account is blocked.", 401);

  const isMatch = await verifyPassword(password, user.password);
  if (!isMatch)
    throw new AppError("Invalid credentials or account is blocked.", 401);

  const userLocalDateStr =
    userLocalDate || new Date().toISOString().split("T")[0];
  const streak = await trackDailyActivity(user, userLocalDateStr);
  await user.save();

  return { user, streak };
};

/**
 * Validates a refresh token and tracks daily streak activity.
 * @async
 * @param {Object} decoded - Decoded JWT payload.
 * @param {string} [userLocalDate] - ISO date string for streak tracking.
 * @returns {Promise<{user: Object, streak: Object}>} The user and streak data.
 * @throws {AppError} 403 if token is revoked or account is blocked.
 */
const rotateRefreshToken = async (decoded, userLocalDate) => {
  const user = await User.findById(decoded.id).select("+ageBracket");
  if (user) userUtils.reconcileLeaderboardStatus(user);
  if (!user || user.isBlocked)
    throw new AppError("Invalid account or account is blocked.", 403);
  if (decoded.refreshTokenVersion !== user.refreshTokenVersion)
    throw new AppError("Refresh token revoked. Please log in again.", 403);

  const userLocalDateStr =
    userLocalDate || new Date().toISOString().split("T")[0];
  const streak = await trackDailyActivity(user, userLocalDateStr);
  await user.save();

  return { user, streak };
};

/**
 * Revokes all active sessions for a user by incrementing their token version.
 * @async
 * @param {string} userId - The ID of the user.
 */
const revokeUserSessions = async (userId) => {
  if (!userId) return;
  const user = await User.findById(userId);
  if (!user) return;
  user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
  await user.save();
};

/**
 * Generates a password reset token and emails it to the user.
 * @async
 * @param {string} email - The user's email address.
 * @returns {Promise<{message: string, preview: Object|null}>} Generic message and dev preview.
 */
const createPasswordReset = async (email) => {
  if (!validationHelper.validateEmail(email))
    throw new AppError("Please provide a valid email address", 400);

  const genericMessage =
    "If an account with that email exists, a password reset link has been sent.";
  const user = await User.findOne({ email });
  if (!user) return { message: genericMessage, preview: null };

  const resetToken = crypto
    .randomBytes(authConstants.RESET_TOKEN_BYTES)
    .toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + authConstants.RESET_TOKEN_TTL_MS;
  await user.save();

  const resetUrl = `${config.getFrontendUrl()}/reset-password/${resetToken}`;
  const { subject, html } = emailTemplates.createPasswordResetEmail(resetUrl);
  const emailResult = await sendEmail(user.email, subject, html);

  const preview =
    config.isDevelopment() && emailResult.previewUrl
      ? { previewUrl: emailResult.previewUrl, resetToken }
      : null;
  return { message: genericMessage, preview };
};

/**
 * Finds a user with a valid, unexpired password reset token.
 * @async
 * @param {string} token - The reset token.
 * @returns {Promise<Object>} The user document.
 * @throws {AppError} 400 if token is invalid or expired.
 */
const findValidResetUser = async (token) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user)
    throw new AppError("Password reset token is invalid or has expired.", 400);
  return user;
};

/**
 * Resets a user's password using a valid token and revokes existing sessions.
 * @async
 * @param {Object} payload - Contains token and newPassword.
 */
const resetPasswordWithToken = async ({ token, newPassword }) => {
  const passwordValidation = validationHelper.validatePassword(newPassword);
  if (!passwordValidation.isValid)
    throw new AppError(passwordValidation.message, 400);

  const user = await findValidResetUser(token);
  user.password = await hashPassword(newPassword);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
  await user.save();
};

/**
 * Changes an authenticated user's password after verifying the current one.
 * @async
 * @param {string} userId - The user's ID.
 * @param {Object} passwords - Contains currentPassword and newPassword.
 * @returns {Promise<Object>} The updated user document.
 * @throws {AppError} 401 if current password is incorrect.
 */
const changeUserPassword = async (userId, { currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword)
    throw new AppError("Please provide both current and new password.", 400);

  const passwordValidation = validationHelper.validatePassword(newPassword);
  if (!passwordValidation.isValid)
    throw new AppError(passwordValidation.message, 400);

  const user = await User.findById(userId).select("+password");
  if (!user) throw new AppError("User not found.", 404);

  const isMatch = await verifyPassword(currentPassword, user.password);
  if (!isMatch) throw new AppError("Current password is incorrect.", 401);

  user.password = await hashPassword(newPassword);
  user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
  await user.save();
  return user;
};

/**
 * Updates a user's privacy settings, enforcing strict privacy for under-16 users.
 * @async
 * @param {string} userId - The user's ID.
 * @param {Object} settings - The new privacy settings.
 * @returns {Promise<Object>} The updated privacy settings object.
 */
const updateUserPrivacySettings = async (userId, settings) => {
  const { showOnLeaderboards, showAsAnonymous, showUsernameOnLeaderboards } =
    settings;
  if (
    typeof showOnLeaderboards !== "boolean" ||
    typeof showAsAnonymous !== "boolean" ||
    typeof showUsernameOnLeaderboards !== "boolean"
  ) {
    throw new AppError("Invalid privacy settings format", 400);
  }

  const existingUser = await User.findById(userId).select("+ageBracket");
  if (!existingUser) throw new AppError("User not found", 404);

  const finalSettings =
    existingUser.ageBracket === authConstants.RESTRICTED_AGE_BRACKET
      ? {
          showOnLeaderboards: false,
          showAsAnonymous: true,
          showUsernameOnLeaderboards: false,
        }
      : { showOnLeaderboards, showAsAnonymous, showUsernameOnLeaderboards };

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { privacySettings: finalSettings } },
    { new: true, runValidators: true },
  ).select("username privacySettings");

  return user.privacySettings;
};

/**
 * Updates a user's cookie consent preferences.
 * @async
 * @param {string} userId - The user's ID.
 * @param {Object} consentData - Contains cookieConsent and optional cookieConsentDate.
 * @returns {Promise<Object>} The updated consent data.
 */
const updateUserCookieConsent = async (
  userId,
  { cookieConsent, cookieConsentDate },
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        cookieConsent,
        cookieConsentDate: cookieConsentDate || new Date(),
      },
    },
    { new: true, runValidators: true },
  ).select("cookieConsent cookieConsentDate");

  if (!user) throw new AppError("User not found.", 404);
  return {
    cookieConsent: user.cookieConsent,
    cookieConsentDate: user.cookieConsentDate,
  };
};

// +=============================================+
// |              ACCOUNT SERVICE                |
// +=============================================+

/**
 * Deletes a user account and all associated data after password verification.
 * @async
 * @param {string} userId - The user's ID.
 * @param {string} password - The user's current password for confirmation.
 * @throws {AppError} 401 if password is incorrect.
 */
const deleteUserAccount = async (userId, password) => {
  if (!password)
    throw new AppError(
      "Please provide your password to confirm deletion.",
      400,
    );

  const user = await User.findById(userId).select("+password");
  if (!user) throw new AppError("User not found.", 404);

  const isMatch = await verifyPassword(password, user.password);
  if (!isMatch)
    throw new AppError("Password is incorrect. Account not deleted.", 401);

  if (config.isProduction()) {
    await deleteWithTransaction(user._id);
  } else {
    await deleteWithoutTransaction(user._id);
  }
};

const cascadeDelete = (id, session) => {
  const q = (fn) => (session ? fn.session(session) : fn);
  return Promise.all([
    q(ActivityLog.deleteMany({ userId: id })),
    q(FlaggedContent.deleteMany({ reporterId: id })),
    q(LessonCompletion.deleteMany({ userId: id })),
    q(ModuleCompletion.deleteMany({ userId: id })),
    q(QuizAttempt.deleteMany({ userId: id })),
    q(XpTransaction.deleteMany({ userId: id })),
    q(LessonQuizProgress.deleteMany({ userId: id })),
    q(Session.deleteMany({ userId: id })),
  ]);
};

const detachAdminLogs = (id, session) => {
  const q = AdminLog.updateMany(
    { adminId: id },
    { $set: { adminId: null, changes: { note: "Admin account deleted" } } },
  );
  return session ? q.session(session) : q;
};

const deleteWithTransaction = async (id) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await User.findByIdAndDelete(id).session(session);
    await cascadeDelete(id, session);
    await detachAdminLogs(id, session);
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

const deleteWithoutTransaction = async (id) => {
  await User.findByIdAndDelete(id);
  await cascadeDelete(id, null);
  await detachAdminLogs(id, null);
};

/**
 * Exports all user data for GDPR Right of Access.
 * @async
 * @param {string} userId - The user's ID.
 * @returns {Promise<Object>} The complete data export object.
 */
const exportUserDataFor = async (userId) => {
  const user = await User.findById(userId)
    .select(
      "-password -refreshTokenVersion -resetPasswordToken -resetPasswordExpires",
    )
    .lean();
  if (!user) throw new AppError("User not found.", 404);

  const [
    activityLogs,
    flaggedContent,
    lessonCompletions,
    moduleCompletions,
    quizAttempts,
    xpTransactions,
    lessonQuizProgress,
    sessions,
  ] = await Promise.all([
    ActivityLog.find({ userId }).select("-ipAddress").lean(),
    FlaggedContent.find({ reporterId: userId }).lean(),
    LessonCompletion.find({ userId }).sort({ completedAt: -1 }).lean(),
    ModuleCompletion.find({ userId }).sort({ completedAt: -1 }).lean(),
    QuizAttempt.find({ userId }).sort({ attemptedAt: -1 }).lean(),
    XpTransaction.find({ userId }).sort({ awardedAt: -1 }).lean(),
    LessonQuizProgress.find({ userId }).lean(),
    Session.find({ userId }).lean(),
  ]);

  return {
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
        "Age verification performed at registration. Date of birth is not stored. Age bracket is retained for legal compliance under GDPR and UK Children's Code.",
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      completedLessonsCount: user.completedLessonsCount,
      completedModulesCount: user.completedModulesCount,
      badges: user.badges,
      stats: user.stats,
      privacySettings: user.privacySettings,
      cookieConsent: user.cookieConsent,
      cookieConsentDate: user.cookieConsentDate,
    },
    lessonCompletions: {
      count: lessonCompletions.length,
      data: lessonCompletions,
    },
    moduleCompletions: {
      count: moduleCompletions.length,
      data: moduleCompletions,
    },
    quizAttempts: { count: quizAttempts.length, data: quizAttempts },
    xpHistory: { count: xpTransactions.length, data: xpTransactions },
    lessonQuizProgress: {
      count: lessonQuizProgress.length,
      data: lessonQuizProgress,
    },
    activityLogs: {
      count: activityLogs.length,
      data: activityLogs,
      note: "IP addresses have been removed for privacy. Activity logs auto-delete after 90 days.",
    },
    flaggedContent: { count: flaggedContent.length, data: flaggedContent },
    sessions: { count: sessions.length, data: sessions },
  };
};

// +=============================================+
// |              FLAG SERVICE                   |
// +=============================================+

const targetExists = async (targetType, targetId) => {
  if (targetType === "LESSON") return !!(await Lesson.findById(targetId));
  if (targetType === "EXERCISE")
    return !!(await Lesson.findOne({ "exercise.id": targetId }));
  if (targetType === "QUIZ")
    return !!(await Lesson.findOne({ "quiz.id": targetId }));
  return false;
};

/**
 * Creates a new content flag for admin review.
 * @async
 * @param {string} reporterId - The ID of the user reporting the content.
 * @param {Object} payload - The flag details.
 * @returns {Promise<Object>} The created FlaggedContent document.
 * @throws {AppError} 400/404 if validation fails or target doesn't exist.
 */
const createContentFlag = async (reporterId, payload) => {
  const { targetType, targetId, issueType, title, description, suggestedFix } =
    payload;

  if (!authConstants.VALID_TARGET_TYPES.includes(targetType))
    throw new AppError("Invalid target type", 400);
  if (!authConstants.VALID_ISSUE_TYPES.includes(issueType))
    throw new AppError("Invalid issue type", 400);
  if (!title || !description)
    throw new AppError("Title and description are required", 400);
  if (!(await targetExists(targetType, targetId)))
    throw new AppError("Target not found", 404);

  const existingFlag = await FlaggedContent.findOne({
    targetType,
    targetId,
    reporterId,
    issueType,
    status: { $in: ["PENDING", "IN_REVIEW"] },
  });
  if (existingFlag)
    throw new AppError(
      `You already reported a ${issueType.replace(/_/g, " ").toLowerCase()} issue for this content. It is being reviewed.`,
      400,
    );

  return FlaggedContent.create({
    targetType,
    targetId,
    reporterId,
    issueType,
    title,
    description,
    suggestedFix,
    status: "PENDING",
  });
};

// ─────── EXPORTS ───────
module.exports = {
  // AUTHENTICATION
  registerUser,
  authenticateUser,
  rotateRefreshToken,
  revokeUserSessions,
  createPasswordReset,
  findValidResetUser,
  resetPasswordWithToken,
  changeUserPassword,
  updateUserPrivacySettings,
  updateUserCookieConsent,
  // ACCOUNT SERVICE
  deleteUserAccount,
  exportUserDataFor,
  // FLAG SERVICE
  createContentFlag,
};
