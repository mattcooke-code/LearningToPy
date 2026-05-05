const {
  validateEmail,
  validatePassword,
  validateUsername,
  validateContent,
  validateIP,
  validateSessionId,
} = require("../utils/validationHelpers");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

/**
 * Validation Middleware
 *
 * Thin wrappers around `validationHelpers.js` for use as Express middleware.
 * Each function validates specific request shapes and passes or returns 400 errors.
 *
 * Also exports a `createValidator` factory for building custom validators from
 * rule definitions.
 *
 * @middleware Applied per-route before controller functions
 */

/**
 * Middleware to validate user registration data
 */
exports.validateUserRegistration = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  // Validate username
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    return next(new AppError(usernameValidation.message, 400));
  }

  // Validate email
  if (!validateEmail(email)) {
    return next(new AppError("Please provide a valid email address", 400));
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return next(new AppError(passwordValidation.message, 400));
  }

  next();
});

/**
 * Middleware to validate user login data
 */
exports.validateUserLogin = catchAsync(async (req, res, next) => {
  const { credential, password } = req.body;

  if (!credential || !password) {
    return next(
      new AppError("Please provide email/username and password", 400),
    );
  }

  // Basic credential validation (more detailed validation happens in User.findByCredential)
  if (typeof credential !== "string" || credential.trim().length < 3) {
    return next(new AppError("Invalid credential format", 400));
  }

  // Basic password validation (strength check happens at registration)
  if (typeof password !== "string" || password.length < 1) {
    return next(new AppError("Password is required", 400));
  }

  next();
});

/**
 * Middleware to validate password reset request
 */
exports.validatePasswordReset = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  if (!validateEmail(email)) {
    return next(new AppError("Please provide a valid email address", 400));
  }

  next();
});

/**
 * Middleware to validate password reset confirmation
 */
exports.validatePasswordResetConfirm = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return next(new AppError("Reset token and password are required", 400));
  }

  // Validate new password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return next(new AppError(passwordValidation.message, 400));
  }

  next();
});

/**
 * Middleware to validate profile update data
 */
exports.validateProfileUpdate = catchAsync(async (req, res, next) => {
  const { username, email } = req.body;

  // Validate username if provided
  if (username !== undefined) {
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return next(new AppError(usernameValidation.message, 400));
    }
  }

  // Validate email if provided
  if (email !== undefined && email !== "") {
    if (!validateEmail(email)) {
      return next(new AppError("Please provide a valid email address", 400));
    }
  }

  next();
});

/**
 * Middleware to validate content creation/update data
 */
exports.validateContent = catchAsync(async (req, res, next) => {
  const { title, description, content } = req.body;

  // Validate title if provided
  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length < 3) {
      return next(
        new AppError("Title must be at least 3 characters long", 400),
      );
    }

    const titleValidation = validateContent(title);
    if (!titleValidation.isValid) {
      return next(new AppError(titleValidation.message, 400));
    }
  }

  // Validate description if provided
  if (description !== undefined) {
    if (typeof description !== "string" || description.trim().length < 10) {
      return next(
        new AppError("Description must be at least 10 characters long", 400),
      );
    }

    const descriptionValidation = validateContent(description);
    if (!descriptionValidation.isValid) {
      return next(new AppError(descriptionValidation.message, 400));
    }
  }

  // Validate content if provided
  if (content !== undefined) {
    if (typeof content !== "string" || content.trim().length < 10) {
      return next(
        new AppError("Content must be at least 10 characters long", 400),
      );
    }

    const contentValidation = validateContent(content);
    if (!contentValidation.isValid) {
      return next(new AppError(contentValidation.message, 400));
    }
  }

  next();
});

/**
 * Middleware to validate flagged content submission
 */
exports.validateFlaggedContent = catchAsync(async (req, res, next) => {
  const { title, description, issueType, targetType, targetId } = req.body;

  // Validate required fields
  if (!title || !description || !issueType || !targetType || !targetId) {
    return next(
      new AppError(
        "Title, description, issue type, target type, and target ID are required",
        400,
      ),
    );
  }

  // Validate title
  if (
    typeof title !== "string" ||
    title.trim().length < 5 ||
    title.trim().length > 200
  ) {
    return next(
      new AppError("Title must be between 5 and 200 characters", 400),
    );
  }

  const titleValidation = validateContent(title);
  if (!titleValidation.isValid) {
    return next(new AppError(titleValidation.message, 400));
  }

  // Validate description
  if (
    typeof description !== "string" ||
    description.trim().length < 10 ||
    description.trim().length > 2000
  ) {
    return next(
      new AppError("Description must be between 10 and 2000 characters", 400),
    );
  }

  const descriptionValidation = validateContent(description);
  if (!descriptionValidation.isValid) {
    return next(new AppError(descriptionValidation.message, 400));
  }

  // Validate suggested fix if provided
  if (req.body.suggestedFix) {
    if (
      typeof req.body.suggestedFix !== "string" ||
      req.body.suggestedFix.trim().length > 1000
    ) {
      return next(
        new AppError("Suggested fix must not exceed 1000 characters", 400),
      );
    }

    const suggestedFixValidation = validateContent(req.body.suggestedFix);
    if (!suggestedFixValidation.isValid) {
      return next(new AppError(suggestedFixValidation.message, 400));
    }
  }

  next();
});

/**
 * Middleware to validate admin action data
 */
exports.validateAdminAction = catchAsync(async (req, res, next) => {
  const { action, targetType, targetId, reason } = req.body;

  // Validate required fields
  if (!action || !targetType) {
    return next(new AppError("Action and target type are required", 400));
  }

  // Validate reason if provided
  if (reason !== undefined) {
    if (typeof reason !== "string" || reason.trim().length > 1000) {
      return next(new AppError("Reason must not exceed 1000 characters", 400));
    }

    const reasonValidation = validateContent(reason);
    if (!reasonValidation.isValid) {
      return next(new AppError(reasonValidation.message, 400));
    }
  }

  next();
});

/**
 * Middleware to sanitize and validate IP addresses
 */
exports.validateIPAddress = catchAsync(async (req, res, next) => {
  const ipAddress =
    req.ip || req.connection.remoteAddress || req.headers["x-forwarded-for"];

  if (ipAddress && !validateIP(ipAddress)) {
    // Don't block the request, but log the invalid IP
    console.warn(`Invalid IP address detected: ${ipAddress}`);
  }

  // Store validated IP for logging
  req.validatedIP = ipAddress;
  next();
});

/**
 * Middleware to validate session IDs
 */
exports.validateSessionId = catchAsync(async (req, res, next) => {
  const sessionId = req.sessionID || req.headers["x-session-id"];

  if (sessionId && !validateSessionId(sessionId)) {
    return next(new AppError("Invalid session format", 400));
  }

  next();
});

/**
 * Generic validation middleware factory
 * @param {Object} validationRules - Object containing field validation rules
 * @returns {Function} - Express middleware function
 */
exports.createValidator = (validationRules) => {
  return catchAsync(async (req, res, next) => {
    const errors = [];

    Object.entries(validationRules).forEach(([field, rules]) => {
      const value = req.body[field];

      // Check if field is required
      if (
        rules.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push(`${field} is required`);
        return;
      }

      // Skip validation if field is not provided and not required
      if (value === undefined || value === null || value === "") {
        return;
      }

      // Apply validation functions
      if (rules.validate && typeof rules.validate === "function") {
        const result = rules.validate(value);
        if (!result.isValid) {
          errors.push(`${field}: ${result.message}`);
        }
      }

      // Apply custom validation
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
  });
};
