/**
 * Centralized validation helpers for LearningToPy platform
 * Provides reusable validation functions for schemas and middleware
 */

/**
 * Validates email format and checks against disposable domains
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
exports.validateEmail = function(email) {
  if (!email || typeof email !== 'string') return false;
  
  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return false;
  
  // Check against common disposable email domains
  const disposableDomains = [
    'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
    'throwaway.email', 'maildrop.cc', 'yopmail.com', 'temp-mail.org',
    'getairmail.com', 'mailinator.net', 'spam4.me', '0wnd.net'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return !disposableDomains.some(d => domain?.includes(d));
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
exports.validatePassword = function(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'Password must not exceed 128 characters' };
  }
  
  // Strong password validation
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  if (!strongPasswordRegex.test(password)) {
    return { 
      isValid: false, 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)' 
    };
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwerty', 'admin', 'letmein',
    'welcome', 'monkey', 'dragon', 'master', 'sunshine', 'princess'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    return { isValid: false, message: 'Password is too common. Please choose a stronger password.' };
  }
  
  return { isValid: true, message: 'Password is valid' };
};

/**
 * Validates username format and checks against reserved names
 * @param {string} username - Username to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
exports.validateUsername = function(username) {
  if (!username || typeof username !== 'string') {
    return { isValid: false, message: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { isValid: false, message: 'Username must be at least 3 characters' };
  }
  
  if (username.length > 30) {
    return { isValid: false, message: 'Username must not exceed 30 characters' };
  }
  
  // Username format validation (letters, numbers, underscores only)
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }
  
  // Check against reserved usernames
  const reserved = [
    'admin', 'root', 'system', 'api', 'www', 'mail', 'support', 'null', 'undefined',
    'user', 'test', 'demo', 'guest', 'anonymous', 'moderator', 'superadmin'
  ];
  
  if (reserved.includes(username.toLowerCase())) {
    return { isValid: false, message: 'Username is reserved' };
  }
  
  return { isValid: true, message: 'Username is valid' };
};

/**
 * Validates IP address format (IPv4 and IPv6)
 * @param {string} ip - IP address to validate
 * @returns {boolean} - True if valid
 */
exports.validateIP = function(ip) {
  if (!ip || typeof ip !== 'string') return false;
  
  // IPv4 regex
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6 regex (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

/**
 * Validates content for XSS prevention
 * @param {string} content - Content to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
exports.validateContent = function(content) {
  if (!content || typeof content !== 'string') {
    return { isValid: false, message: 'Content is required' };
  }
  
  // Check for script tags and event handlers
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi
  ];
  
  for (const pattern of xssPatterns) {
    if (pattern.test(content)) {
      return { isValid: false, message: 'Content contains potentially dangerous script elements' };
    }
  }
  
  return { isValid: true, message: 'Content is valid' };
};

/**
 * Validates session ID format
 * @param {string} sessionId - Session ID to validate
 * @returns {boolean} - True if valid
 */
exports.validateSessionId = function(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') return false;
  
  if (sessionId.length < 10 || sessionId.length > 100) return false;
  
  // Allow letters, numbers, underscores, and hyphens
  const sessionIdRegex = /^[a-zA-Z0-9_-]+$/;
  return sessionIdRegex.test(sessionId);
};

/**
 * Validates XP reward values
 * @param {number} xp - XP value to validate
 * @param {object} options - Validation options
 * @returns {object} - { isValid: boolean, message: string }
 */
exports.validateXP = function(xp, options = {}) {
  const { min = 0, max = 1000, allowFloat = false } = options;
  
  if (typeof xp !== 'number' || isNaN(xp)) {
    return { isValid: false, message: 'XP must be a valid number' };
  }
  
  if (xp < min) {
    return { isValid: false, message: `XP cannot be less than ${min}` };
  }
  
  if (xp > max) {
    return { isValid: false, message: `XP cannot exceed ${max}` };
  }
  
  if (!allowFloat && !Number.isInteger(xp)) {
    return { isValid: false, message: 'XP must be an integer' };
  }
  
  return { isValid: true, message: 'XP value is valid' };
};

/**
 * Sanitizes string input by trimming and removing excessive whitespace
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized string
 */
exports.sanitizeString = function(input) {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[\r\n\t]/g, ' '); // Replace line breaks and tabs with spaces
};

/**
 * Validates enum values against allowed values
 * @param {string} value - Value to validate
 * @param {array} allowedValues - Array of allowed values
 * @returns {boolean} - True if valid
 */
exports.validateEnum = function(value, allowedValues) {
  if (!Array.isArray(allowedValues)) return false;
  return allowedValues.includes(value);
};

/**
 * Validates ObjectId format
 * @param {string} id - ObjectId string to validate
 * @returns {boolean} - True if valid ObjectId
 */
exports.validateObjectId = function(id) {
  if (!id || typeof id !== 'string') return false;
  
  // MongoDB ObjectId validation (24 character hex string)
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Validates date range
 * @param {Date} date - Date to validate
 * @param {object} options - Validation options
 * @returns {object} - { isValid: boolean, message: string }
 */
exports.validateDate = function(date, options = {}) {
  const { minDate, maxDate, allowFuture = true, allowPast = true } = options;
  
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return { isValid: false, message: 'Invalid date format' };
  }
  
  const now = new Date();
  
  if (!allowFuture && date > now) {
    return { isValid: false, message: 'Date cannot be in the future' };
  }
  
  if (!allowPast && date < now) {
    return { isValid: false, message: 'Date cannot be in the past' };
  }
  
  if (minDate && date < minDate) {
    return { isValid: false, message: `Date must be after ${minDate.toDateString()}` };
  }
  
  if (maxDate && date > maxDate) {
    return { isValid: false, message: `Date must be before ${maxDate.toDateString()}` };
  }
  
  return { isValid: true, message: 'Date is valid' };
};
