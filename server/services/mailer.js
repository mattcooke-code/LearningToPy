// services/mailer.js
const { Resend } = require("resend");
const config = require("../config/envConfig");
const AppError = require("../utils/AppError");

let resendClient = null;

/**
 * Lazily initializes the Resend client.
 * Reuses the same instance across all email sends.
 *
 * @returns {Resend} Configured Resend client
 */
const getResendClient = () => {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      // In development without API key, we'll use the fallback
      if (config.isDevelopment()) {
        console.warn(
          "⚠️  RESEND_API_KEY not set. Emails will be logged to console in development.",
        );
        return null;
      }
      throw new AppError(
        "Email service not configured. Please set RESEND_API_KEY.",
        500,
      );
    }

    resendClient = new Resend(apiKey);
  }

  return resendClient;
};

/**
 * Send an email through Resend.
 * In development without an API key, logs to console instead.
 *
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} htmlContent - HTML body of the email
 * @param {Object} [options] - Optional overrides
 * @param {string} [options.from] - Override the default sender address
 * @param {string} [options.replyTo] - Reply-To email address
 * @returns {Promise<{success: boolean, messageId?: string, previewUrl?: null, error?: string, fallback?: boolean}>}
 */
const sendEmail = async (to, subject, htmlContent, options = {}) => {
  const resend = getResendClient();

  // Development fallback - log to console when no Resend API key
  if (!resend) {
    console.log("\n📧 EMAIL PREVIEW (Development Mode)");
    console.log("==================================");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    if (options.replyTo) console.log(`Reply-To: ${options.replyTo}`);
    console.log("Body:", htmlContent);
    console.log("==================================\n");

    return {
      success: true,
      messageId: `dev-${Date.now()}@localhost`,
      previewUrl: null,
    };
  }

  try {
    const fromAddress = options.from || config.getEmailFrom();

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject: subject,
      html: htmlContent,
      reply_to: options.replyTo || undefined,
    });

    if (error) {
      console.error("❌ Resend API error:", error);

      // In development, don't throw - just log and continue
      if (config.isDevelopment()) {
        console.warn("⚠️ Email failed but continuing in development mode");
        return {
          success: false,
          error: error.message,
          fallback: true,
        };
      }

      throw new AppError(
        "There was a problem sending the email. Please try again later.",
        500,
      );
    }

    if (config.isDevelopment()) {
      console.log(`✅ Email sent successfully via Resend: ${data?.id}`);
    }

    return {
      success: true,
      messageId: data?.id,
      previewUrl: null,
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
 * Returns the Resend client instance (useful for direct API access).
 * @returns {Resend|null}
 */
const getTransporter = () => getResendClient();

module.exports = {
  sendEmail,
  getTransporter,
};
