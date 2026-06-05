// middleware/validation.js
const {
  validateEmail,
  validatePassword,
  validateUsername,
  validateContent,
  validateIP,
  validateSessionId,
} = require("../utils/validationHelpers");
const AppError = require("../utils/AppError");

/**
 * Validation Middleware
 *
 * Thin wrappers around `validationHelpers.js` for use as Express middleware.
 * Each function validates specific request shapes and passes or returns 400 errors.
 *
 * All validators are synchronous — no database calls, no side effects.
 *
 * Also exports a `createValidator` factory for building custom validators from
 * rule definitions.
 *
 * @middleware Applied per-route before controller functions
 */

// ── Helper ──────────────────────────────────────────────────────
/**
 * Run a validation function and forward the error to Express if it fails.
 * Returns true if validation passed (or value was absent), false if an error was sent.
 */
const validateOrFail = (value, validatorFn, next) => {
  if (value === undefined || value === null) return true;
  const result = validatorFn(value);
  if (!result.isValid) {
    next(new AppError(result.message, 400));
    return false;
  }
  return true;
};

// ── Middleware ───────────────────────────────────────────────────

/**
 * Validate user registration data
 */
const validateUserRegistration = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!validateOrFail(username, validateUsername, next)) return;
  if (
    !validateOrFail(
      email,
      (v) => ({
        isValid: validateEmail(v),
        message: "Please provide a valid email address",
      }),
      next,
    )
  )
    return;
  if (!validateOrFail(password, validatePassword, next)) return;

  next();
};

/**
 * Validate user login data
 * Accepts either 'email' or 'credential' as the identifier field
 */
const validateUserLogin = (req, res, next) => {
  const { email, credential, password } = req.body;
  const identifier = email || credential;

  if (!identifier || !password) {
    return next(
      new AppError("Please provide email/username and password", 400),
    );
  }

  if (typeof identifier !== "string" || identifier.trim().length < 3) {
    return next(new AppError("Invalid credential format", 400));
  }

  if (typeof password !== "string" || password.length < 1) {
    return next(new AppError("Password is required", 400));
  }

  next();
};

/**
 * Validate password reset request
 */
const validatePasswordReset = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  if (!validateEmail(email)) {
    return next(new AppError("Please provide a valid email address", 400));
  }

  next();
};

/**
 * Validate password reset confirmation
 */
const validatePasswordResetConfirm = (req, res, next) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return next(new AppError("Reset token and password are required", 400));
  }

  if (!validateOrFail(password, validatePassword, next)) return;

  next();
};

/**
 * Validate password change
 * Also checks new password differs from current — controller duplicates this
 * but middleware catches it earlier (fail-fast).
 */
const validatePasswordChange = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new AppError("Current password and new password are required", 400),
    );
  }

  if (!validateOrFail(newPassword, validatePassword, next)) return;

  if (currentPassword === newPassword) {
    return next(
      new AppError("New password must be different from current password", 400),
    );
  }

  next();
};

/**
 * Validate profile update data
 */
const validateProfileUpdate = (req, res, next) => {
  const { username, email } = req.body;

  if (
    username !== undefined &&
    !validateOrFail(username, validateUsername, next)
  )
    return;

  if (email !== undefined && email !== "") {
    if (!validateEmail(email)) {
      return next(new AppError("Please provide a valid email address", 400));
    }
  }

  next();
};

/**
 * Validate content creation/update data
 */
const validateContent = (req, res, next) => {
  const { title, description, content } = req.body;

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length < 3) {
      return next(
        new AppError("Title must be at least 3 characters long", 400),
      );
    }
    if (!validateOrFail(title, validateContent, next)) return;
  }

  if (description !== undefined) {
    if (typeof description !== "string" || description.trim().length < 10) {
      return next(
        new AppError("Description must be at least 10 characters long", 400),
      );
    }
    if (!validateOrFail(description, validateContent, next)) return;
  }

  if (content !== undefined) {
    if (typeof content !== "string" || content.trim().length < 10) {
      return next(
        new AppError("Content must be at least 10 characters long", 400),
      );
    }
    if (!validateOrFail(content, validateContent, next)) return;
  }

  next();
};

/**
 * Validate flagged content submission
 */
const validateFlaggedContent = (req, res, next) => {
  const { title, description, issueType, targetType, targetId } = req.body;

  if (!title || !description || !issueType || !targetType || !targetId) {
    return next(
      new AppError(
        "Title, description, issue type, target type, and target ID are required",
        400,
      ),
    );
  }

  if (
    typeof title !== "string" ||
    title.trim().length < 5 ||
    title.trim().length > 200
  ) {
    return next(
      new AppError("Title must be between 5 and 200 characters", 400),
    );
  }
  if (!validateOrFail(title, validateContent, next)) return;

  if (
    typeof description !== "string" ||
    description.trim().length < 10 ||
    description.trim().length > 2000
  ) {
    return next(
      new AppError("Description must be between 10 and 2000 characters", 400),
    );
  }
  if (!validateOrFail(description, validateContent, next)) return;

  if (req.body.suggestedFix) {
    if (
      typeof req.body.suggestedFix !== "string" ||
      req.body.suggestedFix.trim().length > 1000
    ) {
      return next(
        new AppError("Suggested fix must not exceed 1000 characters", 400),
      );
    }
    if (!validateOrFail(req.body.suggestedFix, validateContent, next)) return;
  }

  next();
};

/**
 * Validate admin action data
 */
const validateAdminAction = (req, res, next) => {
  const { action, targetType, reason } = req.body;

  if (!action || !targetType) {
    return next(new AppError("Action and target type are required", 400));
  }

  if (reason !== undefined) {
    if (typeof reason !== "string" || reason.trim().length > 1000) {
      return next(new AppError("Reason must not exceed 1000 characters", 400));
    }
    if (!validateOrFail(reason, validateContent, next)) return;
  }

  next();
};

/**
 * Sanitize and validate IP addresses
 * Non-blocking — invalid IPs are logged but requests proceed.
 */
const validateIPAddress = (req, res, next) => {
  const ipAddress =
    req.ip || req.connection.remoteAddress || req.headers["x-forwarded-for"];

  if (ipAddress && !validateIP(ipAddress)) {
    console.warn(`Invalid IP address detected: ${ipAddress}`);
  }

  req.validatedIP = ipAddress;
  next();
};

/**
 * Validate session IDs
 */
const validateSessionId = (req, res, next) => {
  const sessionId = req.sessionID || req.headers["x-session-id"];

  if (sessionId && !validateSessionId(sessionId)) {
    return next(new AppError("Invalid session format", 400));
  }

  next();
};

/**
 * Generic validation middleware factory
 * @param {Object} validationRules - Object containing field validation rules
 * @returns {Function} - Express middleware function
 */
const createValidator = (validationRules) => {
  return (req, res, next) => {
    const errors = [];

    Object.entries(validationRules).forEach(([field, rules]) => {
      const value = req.body[field];

      if (
        rules.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push(`${field} is required`);
        return;
      }

      if (value === undefined || value === null || value === "") {
        return;
      }

      if (rules.validate && typeof rules.validate === "function") {
        const result = rules.validate(value);
        if (!result.isValid) {
          errors.push(`${field}: ${result.message}`);
        }
      }

      if (rules.custom && typeof rules.custom === "function") {
        const customResult = rules.custom(value, req.body);
        if (customResult !== true) {
          errors.push(`${field}: ${customResult}`);
        }
      }
    });

    if (errors.length > 0) {
      return next(new AppError(errors.join("; "), 400));
    }

    next();
  };
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordReset,
  validatePasswordResetConfirm,
  validatePasswordChange,
  validateProfileUpdate,
  validateContent,
  validateFlaggedContent,
  validateAdminAction,
  validateIPAddress,
  validateSessionId,
  createValidator,
};
