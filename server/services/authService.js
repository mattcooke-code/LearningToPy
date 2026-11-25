// services/authService.js
// ─────────────── IMPORTS ──────────────────
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const config = require("../config/envConfig");

// MODELS
const ActivityLog = require("../models/ActivityLog");
const AdminLog = require("../models/AdminLog");
const CourseCompletion = require("../models/CourseCompletion");
const ExerciseProgress = require("../models/ExerciseProgress");
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
const mailer = require("./mailer");
const streakManager = require("./streakManager");

// UTILITIES & CONSTANTS
const AppError = require("../utils/AppError");
const dbHelpers = require("../utils/dbHelpers");
const emailTemplates = require("../utils/emailTemplates");
const generalUtils = require("../utils/generalUtils");
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

/**
 * Lazily-built bcrypt hash used to equalise login timing when no user
 * matched. Built with the same cost factor as real hashes, so a login for a
 * non-existent account takes as long as one for a real account.
 * @returns {Promise<string>}
 */
let dummyHash;
const getDummyHash = async () => {
  if (!dummyHash) dummyHash = await hashPassword("timing-equalisation-only");
  return dummyHash;
};

/**
 * One-way hash of a password-reset token. Only the hash is stored, so a
 * database leak does not expose usable reset links.
 * @param {string} token - Raw token (the value that is emailed)
 * @returns {string} hex SHA-256 digest
 */
const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/**
 * Increment a user's refresh-token version in memory (caller must save()).
 * Invalidates every outstanding refresh token for that user.
 * @param {Object} user - Mongoose user document
 */
const bumpTokenVersion = (user) => {
  user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
};

/**
 * Track daily streak activity for a user and persist the change.
 * @param {Object} user - Mongoose user document
 * @param {string} [userLocalDate] - Client-supplied YYYY-MM-DD. streakManager
 *   validates it and falls back to today (UTC) if missing or implausible.
 * @returns {Promise<Object>} Streak data
 */
const recordActivity = async (user, userLocalDate) => {
  const streak = await streakManager.trackDailyActivity(user, userLocalDate);
  await user.save();
  return streak;
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
    throw new AppError("Please provide a valid email address.", 400);

  const passwordValidation = validationHelper.validatePassword(password);
  if (!passwordValidation.isValid)
    throw new AppError(passwordValidation.message, 400);
  if (!dateOfBirth) throw new AppError("Date of birth is required.", 400);

  const birthDate = generalUtils.normalizeDate(dateOfBirth);
  if (!birthDate) throw new AppError("Invalid date of birth.", 400);

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

  // Friendly pre-check. Not race-proof on its own: the unique indexes on
  // email/username are the real guard (see the E11000 handling below).
  const [emailTaken, usernameTaken] = await Promise.all([
    User.exists({ email }),
    User.exists({ username }),
  ]);

  if (emailTaken) throw new AppError("Email already in use.", 400);
  if (usernameTaken) throw new AppError("Username already taken.", 400);

  const hashed = await hashPassword(password);

  let newUser;
  try {
    newUser = await User.create({
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
  } catch (err) {
    // Two simultaneous sign-ups can both pass the pre-check above.
    if (err.code === 11000) {
      if (err.keyPattern?.email)
        throw new AppError("Email already in use.", 400);
      if (err.keyPattern?.username)
        throw new AppError("Username already taken.", 400);
    }
    throw err;
  }

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
  if (
    typeof loginIdentifier !== "string" ||
    typeof password !== "string" ||
    !loginIdentifier ||
    !password
  )
    throw new AppError("Please provide credentials and a password.", 400);

  const user = await User.findByCredential(loginIdentifier);
  if (user) userUtils.reconcileLeaderboardStatus(user);

  // Always run one bcrypt comparison (against a dummy hash if there is no
  // usable user) so response time doesn't reveal whether an account exists.
  const hashToCheck = user?.password || (await getDummyHash());
  const isMatch = await verifyPassword(password, hashToCheck);

  if (!user || user.isBlocked || !isMatch)
    throw new AppError("Invalid credentials or account is blocked.", 401);

  const streak = await recordActivity(user, userLocalDate);
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

  const streak = await recordActivity(user, userLocalDate);
  return { user, streak };
};

/**
 * Revokes all active sessions for a user by incrementing their token version.
 * Uses an atomic $inc so concurrent revocations can't overwrite each other.
 * @async
 * @param {string} userId - The ID of the user.
 */
const revokeUserSessions = async (userId) => {
  if (!userId) return;
  await User.updateOne({ _id: userId }, { $inc: { refreshTokenVersion: 1 } });
};

/**
 * Generates a password reset token and emails it to the user.
 * Only a SHA-256 hash of the token is stored; the raw token exists only in
 * the emailed link (and the dev-mode preview).
 * @async
 * @param {string} email - The user's email address.
 * @returns {Promise<{message: string, preview: Object|null}>} Generic message and dev preview.
 */
const createPasswordReset = async (email) => {
  if (!validationHelper.validateEmail(email))
    throw new AppError("Please provide a valid email address.", 400);

  const genericMessage =
    "If an account with that email exists, a password reset link has been sent.";
  const user = await User.findOne({ email });
  if (!user) return { message: genericMessage, preview: null };

  const resetToken = crypto
    .randomBytes(authConstants.RESET_TOKEN_BYTES)
    .toString("hex");
  user.resetPasswordToken = hashResetToken(resetToken);
  user.resetPasswordExpires = new Date(
    Date.now() + authConstants.RESET_TOKEN_TTL_MS,
  );
  await user.save();

  const resetUrl = `${config.getFrontendUrl()}/reset-password/${resetToken}`;
  const { subject, html } = emailTemplates.createPasswordResetEmail(resetUrl);
  const emailResult = await mailer.sendEmail(user.email, subject, html);

  const preview =
    config.isDevelopment() && emailResult.previewUrl
      ? { previewUrl: emailResult.previewUrl, resetToken }
      : null;
  return { message: genericMessage, preview };
};

/**
 * Finds a user with a valid, unexpired password reset token.
 * @async
 * @param {string} token - The raw reset token (as received from the emailed link).
 * @returns {Promise<Object>} The user document.
 * @throws {AppError} 400 if token is invalid or expired.
 */
const findValidResetUser = async (token) => {
  // Reject non-strings so a crafted object can never reach the query.
  if (typeof token !== "string" || !token)
    throw new AppError("Password reset token is invalid or has expired.", 400);

  const user = await User.findOne({
    resetPasswordToken: hashResetToken(token),
    resetPasswordExpires: { $gt: new Date() },
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
  bumpTokenVersion(user);
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
  bumpTokenVersion(user);
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
    settings ?? {};
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

  // The account can be deleted between the lookup above and this update.
  if (!user) throw new AppError("User not found", 404);

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
        // Client-supplied: fall back to "now" if missing or unparseable.
        cookieConsentDate:
          generalUtils.normalizeDate(cookieConsentDate) || new Date(),
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
 * Registry of every collection that holds data owned by a user.
 *
 * Account deletion and the GDPR export BOTH read from this list, so they
 * cannot drift apart. When you add a model that stores per-user data, add it
 * here and it is automatically deleted and exported.
 *
 * Order determines key order in the export response.
 *
 * @type {Array<{
 *   exportKey: string,   // key used in the export payload
 *   Model: import("mongoose").Model,
 *   ownerField: string,  // field that references the user
 *   select?: string,     // projection applied on export only
 *   sort?: Object,       // sort applied on export only
 *   note?: string,       // note attached to this section of the export
 * }>}
 */
const USER_OWNED = [
  {
    exportKey: "lessonCompletions",
    Model: LessonCompletion,
    ownerField: "userId",
    sort: { completedAt: -1 },
  },
  {
    exportKey: "moduleCompletions",
    Model: ModuleCompletion,
    ownerField: "userId",
    sort: { completedAt: -1 },
  },
  {
    exportKey: "courseCompletion",
    Model: CourseCompletion,
    ownerField: "userId",
  },
  {
    exportKey: "quizAttempts",
    Model: QuizAttempt,
    ownerField: "userId",
    sort: { attemptedAt: -1 },
  },
  {
    exportKey: "xpHistory",
    Model: XpTransaction,
    ownerField: "userId",
    sort: { awardedAt: -1 },
  },
  {
    exportKey: "lessonQuizProgress",
    Model: LessonQuizProgress,
    ownerField: "userId",
  },
  {
    exportKey: "exerciseProgress",
    Model: ExerciseProgress,
    ownerField: "userId",
    sort: { createdAt: -1 },
  },
  {
    exportKey: "activityLogs",
    Model: ActivityLog,
    ownerField: "userId",
    select: "-ipAddress",
    note: "IP addresses have been removed for privacy. Activity logs auto-delete after 90 days.",
  },
  {
    exportKey: "flaggedContent",
    Model: FlaggedContent,
    ownerField: "reporterId",
  },
  {
    exportKey: "sessions",
    Model: Session,
    ownerField: "userId",
    select: "-ipAddress",
    note: "IP addresses have been removed for privacy. Session records auto-delete after 90 days.",
  },
];

/**
 * Delete all user-owned data (see USER_OWNED).
 * Runs sequentially: operations sharing one transaction session must not be
 * issued in parallel. `session` may be null (non-transactional mode).
 */
const cascadeDelete = async (id, session) => {
  for (const { Model, ownerField } of USER_OWNED) {
    await Model.deleteMany({ [ownerField]: id }).session(session);
  }
};

/**
 * Keep admin audit entries but detach them from a deleted admin account.
 */
const detachAdminLogs = (id, session) =>
  AdminLog.updateMany(
    { adminId: id },
    { $set: { adminId: null, changes: { note: "Admin account deleted" } } },
  ).session(session);

/**
 * Remove a user and everything they own.
 * The user document is deleted LAST: if a step fails outside a transaction,
 * the account still exists and the deletion can simply be retried.
 */
const purgeUserData = async (id, session) => {
  await cascadeDelete(id, session);
  await detachAdminLogs(id, session);
  await User.findByIdAndDelete(id).session(session);
};

const deleteWithTransaction = (id) =>
  dbHelpers.runInTransaction((session) => purgeUserData(id, session));

const deleteWithoutTransaction = (id) => purgeUserData(id, null);

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

/**
 * Exports all user data for GDPR Right of Access.
 * @async
 * @param {string} userId - The user's ID.
 * @returns {Promise<Object>} The complete data export object.
 */
const exportUserDataFor = async (userId) => {
  const user = await User.findById(userId)
    .select(
      "+ageBracket -password -refreshTokenVersion -resetPasswordToken -resetPasswordExpires",
    )
    .lean();
  if (!user) throw new AppError("User not found.", 404);

  const results = await Promise.all(
    USER_OWNED.map(({ Model, ownerField, select, sort }) => {
      const query = Model.find({ [ownerField]: userId });
      if (select) query.select(select);
      if (sort) query.sort(sort);
      return query.lean();
    }),
  );

  const collections = {};
  USER_OWNED.forEach(({ exportKey, note }, i) => {
    collections[exportKey] = {
      count: results[i].length,
      data: results[i],
      ...(note && { note }),
    };
  });

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
    ...collections,
  };
};

// +=============================================+
// |              FLAG SERVICE                   |
// +=============================================+

/**
 * Whether the flagged target exists. A malformed LESSON id raises a
 * CastError, which the global error handler turns into a 400.
 */
const targetExists = async (targetType, targetId) => {
  if (targetType === "LESSON")
    return !!(await Lesson.exists({ _id: targetId }));
  if (targetType === "EXERCISE")
    return !!(await Lesson.exists({ "exercise.id": targetId }));
  if (targetType === "QUIZ")
    return !!(await Lesson.exists({ "quiz.id": targetId }));
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
    throw new AppError("Invalid target type.", 400);
  if (!authConstants.VALID_ISSUE_TYPES.includes(issueType))
    throw new AppError("Invalid issue type.", 400);
  if (!title || !description)
    throw new AppError("Title and description are required.", 400);
  if (!(await targetExists(targetType, targetId)))
    throw new AppError("Target not found.", 404);

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
