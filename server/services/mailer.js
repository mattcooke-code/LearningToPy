// services/mailer.js
const nodemailer = require("nodemailer");
const config = require("../config/envConfig");
const AppError = require("../utils/AppError");

/**
 * Creates a Nodemailer transporter instance.
 * Uses Ethereal (test account) in development when no email credentials are set,
 * otherwise uses the configured SMTP settings from envConfig.
 *
 * @returns {Promise<nodemailer.Transporter>} Configured mail transporter
 */
const createTransporter = async () => {
  // Development with no email config - use Ethereal
  if (config.isDevelopment() && !config.getEmailUser()) {
    const testAccount = await nodemailer.createTestAccount();
    console.log("\n📧 Using Ethereal Email for testing:");
    console.log(`   Preview URL: ${testAccount.web}`);

    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      family: 4, // Force IPv4
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // Use configured email settings
  const emailConfig = config.getEmailConfig();

  // Log config in development (without password)
  if (config.isDevelopment()) {
    console.log("\n📧 Email Configuration:");
    console.log(`   Host: ${emailConfig.host}`);
    console.log(`   Port: ${emailConfig.port}`);
    console.log(`   Secure: ${emailConfig.secure}`);
    console.log(`   User: ${emailConfig.auth.user}`);
    console.log(`   From: ${emailConfig.from}\n`);
  }

  return nodemailer.createTransport({
    ...emailConfig,
    family: 4, // Force IPv4 - CRITICAL for Render
  });
};

let transporterPromise = null;

/**
 * Lazily initializes and caches the email transporter.
 * Reuses the same transporter across all email sends.
 *
 * @returns {Promise<nodemailer.Transporter>} The cached transporter instance
 */
const getTransporter = async () => {
  if (!transporterPromise) {
    transporterPromise = createTransporter().catch((err) => {
      transporterPromise = null; // Reset so next call retries
      throw err;
    });
  }
  return transporterPromise;
};

/**
 * Send an email through the configured transporter.
 * In development without credentials, logs to console instead.
 *
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} htmlContent - HTML body of the email
 * @param {Object} [options] - Optional overrides
 * @param {string} [options.from] - Override the default sender address
 * @returns {Promise<{success: boolean, messageId?: string, previewUrl?: string|null, error?: string, fallback?: boolean}>}
 */
const sendEmail = async (to, subject, htmlContent, options = {}) => {
  // Development fallback - log to console
  if (config.isDevelopment() && !config.getEmailUser()) {
    console.log("\n📧 EMAIL PREVIEW (Development Mode)");
    console.log("==================================");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("Body:", htmlContent);
    console.log("==================================\n");

    return {
      success: true,
      previewUrl: null,
      messageId: `mock-${Date.now()}@development.local`,
    };
  }

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: options.from || config.getEmailFrom(),
      to,
      subject,
      html: htmlContent,
    });

    // Log preview URL for Ethereal
    if (config.isDevelopment() && info.messageId) {
      console.log(`📧 Email sent: ${info.messageId}`);
      if (nodemailer.getTestMessageUrl(info)) {
        console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: config.isDevelopment()
        ? nodemailer.getTestMessageUrl(info)
        : null,
    };
  } catch (err) {
    console.error("❌ Email sending failed:", err);

    // In development, don't throw - just log and continue
    if (config.isDevelopment()) {
      console.warn("⚠️ Email failed but continuing in development mode");
      return {
        success: false,
        error: err.message,
        fallback: true,
      };
    }

    throw new AppError(
      "There was a problem sending the email. Please try again later.",
      500,
    );
  }
};

/**
 * Reset the cached transporter (useful after config changes)
 */
const resetTransporter = () => {
  transporterPromise = null;
};

module.exports = {
  sendEmail,
  getTransporter,
  resetTransporter,
};
