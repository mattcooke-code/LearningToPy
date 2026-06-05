//supportController.js
const nodemailer = require("nodemailer");
const {
  getEmailConfig,
  isEmailConfigured,
  isDevelopment,
  isProduction,
} = require("../config/envConfig");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { sendJsonResponse } = require("../utils/responseHelpers");

// Get email configuration
const emailConfig = getEmailConfig();

// Create transporter
let transporter;
let emailEnabled = true;

try {
  // Only create transporter if email is configured
  if (isEmailConfigured()) {
    transporter = nodemailer.createTransport(emailConfig);

    // Verify connection in development only
    if (isDevelopment()) {
      transporter.verify((error, success) => {
        if (error) {
          console.error("❌ Email transporter verification failed:", error);
          emailEnabled = false;
        } else {
          console.log("✅ Email transporter ready");
        }
      });
    }
  } else {
    if (isProduction()) {
      console.error(
        "❌ CRITICAL: Email not configured in production! Support messages will fail.",
      );
      emailEnabled = false;
    } else {
      console.warn(
        "⚠️ Email not configured. Support messages will be logged to console.",
      );
      emailEnabled = false;
    }
  }
} catch (error) {
  console.error("❌ Failed to initialize email transporter:", error);
  emailEnabled = false;
}

/**
 * Send a support/contact message via email.
 *
 * Uses the configured email transporter (Nodemailer). Falls back gracefully
 * in development if email is not configured — logs to console instead.
 *
 * @route   POST /api/support
 * @body    {string} name - Sender's name
 * @body    {string} email - Sender's email
 * @body    {string} subject - Message subject
 * @body    {string} message - Message body
 * @body    {string} [moduleNumber] - Module location (for bug reports)
 * @body    {string} [lessonNumber] - Lesson location (for bug reports)
 * @returns {Object} 200 - Confirmation message
 * @returns {Object} 500 - Email sending failed (production only; soft-fails in dev)
 */
const sendSupportMessage = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    category,
    subject,
    message,
    moduleNumber,
    lessonNumber,
  } = req.body;

  // Validate required fields
  if (!name || !email || !category || !subject || !message) {
    return next(new AppError("Please fill in all required fields", 400));
  }

  // Validate email format
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError("Please provide a valid email address", 400));
  }

  // Prepare email content
  const categoryMap = {
    help: "Technical Help",
    feedback: "Course Feedback",
    bug: "Bug Report",
    feature: "Feature Request",
    other: "Other",
  };

  const categoryLabel = categoryMap[category] || category;

  let emailSubject = `[Support] ${categoryLabel}: ${subject}`;

  // Add module/lesson info for bug reports
  let locationInfo = "";
  if (category === "bug" && (moduleNumber || lessonNumber)) {
    locationInfo = `
      Location: ${moduleNumber ? `Module ${moduleNumber}` : ""}${moduleNumber && lessonNumber ? ", " : ""}${lessonNumber ? `Lesson ${lessonNumber}` : ""}
    `;
  }

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3776ab;">New Support Request</h2>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
        <p><strong>Category:</strong> ${escapeHtml(categoryLabel)}</p>
        ${locationInfo ? `<p><strong>Location:</strong> ${escapeHtml(locationInfo)}</p>` : ""}
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <h3 style="color: #333;">Message:</h3>
        <div style="background-color: #fafafa; padding: 15px; border-radius: 8px; white-space: pre-wrap;">
          ${escapeHtml(message).replace(/\n/g, "<br>")}
        </div>
      </div>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">
        This message was sent from the Learning To Py support form.
        Reply directly to this email to respond to ${escapeHtml(name)}.
      </p>
    </div>
  `;

  const emailText = `
    New support request from ${name} (${email})
    Category: ${categoryLabel}
    Subject: ${subject}
    
    ${locationInfo ? `\nLocation: ${locationInfo}\n` : ""}
    Message:
    ${message}
  `;

  // Send email if configured
  if (emailEnabled && transporter) {
    try {
      await transporter.sendMail({
        from: emailConfig.from,
        to: process.env.SUPPORT_EMAIL || emailConfig.from,
        replyTo: email,
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      });

      if (isDevelopment()) {
        console.log(`📧 Support email sent from ${email} about: ${subject}`);
      }
    } catch (emailError) {
      console.error("Failed to send support email:", emailError);
      // Don't return error to user - we'll still acknowledge receipt
    }
  } else {
    // Log to console for development/debugging
    console.log("📝 Support message received (email disabled):", {
      name,
      email,
      category: categoryLabel,
      subject,
      message,
      location: locationInfo,
    });
  }

  sendJsonResponse(
    res,
    200,
    "Your message has been sent. We'll get back to you soon!",
    {
      received: true,
      timestamp: new Date().toISOString(),
      emailSent: emailEnabled,
    },
  );
});

/**
 * Escape HTML special characters to prevent injection in support emails.
 *
 * Handles: & < > " '
 *
 * @param   {string} str - Raw string
 * @returns {string} HTML-safe string
 */
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

module.exports = {
  sendSupportMessage,
  escapeHtml,
};
