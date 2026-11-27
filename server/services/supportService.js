// services/supportService.js
const config = require("../config/envConfig");
const mailer = require("./mailer");
const AppError = require("../utils/AppError");
const validationHelper = require("../utils/validationHelpers");
const emailTemplates = require("../utils/emailTemplates");

const REQUIRED_FIELDS = ["name", "email", "category", "subject", "message"];

/**
 * Validate the support-form payload. Throws 400 on the first failure.
 *
 * @param   {Object} payload
 * @throws  {AppError} 400
 */
const validateSupportPayload = (payload) => {
  const missing = REQUIRED_FIELDS.filter(
    (field) => !payload[field] || !String(payload[field]).trim(),
  );
  if (missing.length > 0) {
    throw new AppError("Please fill in all required fields", 400);
  }
  if (!validationHelper.validateEmail(payload.email)) {
    throw new AppError("Please provide a valid email address", 400);
  }
};

/**
 * Handle a support-form submission: validate, build the email, and either
 * send it to the configured support inbox or log it if no inbox is set.
 *
 * The `delivered` flag is intentionally NOT returned to the client — the
 * service guarantees "received" regardless of backend configuration.
 *
 * @param   {Object} payload
 * @returns {Promise<{ received: true, timestamp: string }>}
 * @throws  {AppError} 400 - Missing fields or invalid email
 */
const sendSupportMessage = async (payload) => {
  validateSupportPayload(payload);

  const { email, name, subject } = payload;
  const { subject: emailSubject, html } =
    emailTemplates.createSupportRequestEmail(payload);

  const supportEmail = config.getSupportEmail();

  if (!supportEmail) {
    console.log("📝 Support message received (no SUPPORT_EMAIL configured):", {
      name,
      email,
      subject,
      message: payload.message,
    });
    return { received: true, timestamp: new Date().toISOString() };
  }

  await mailer.sendEmail(supportEmail, emailSubject, html, {
    from: config.getEmailFrom(),
    replyTo: email,
  });

  return { received: true, timestamp: new Date().toISOString() };
};

module.exports = { sendSupportMessage, validateSupportPayload };
