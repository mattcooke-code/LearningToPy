// emailTemplates.js
const { escapeHtml } = require("./generalUtils");

/**
 * Category slug → human-readable label. Unknown slugs fall through to the
 * raw slug so a future category doesn't silently vanish from the email.
 */
const SUPPORT_CATEGORY_LABELS = Object.freeze({
  help: "Technical Help",
  feedback: "Course Feedback",
  bug: "Bug Report",
  feature: "Feature Request",
  other: "Other",
});

/**
 * Generates the HTML content for a password reset email.
 * @param {string} resetUrl - The full password reset URL with token
 * @returns {{ subject: string, html: string }} Email subject and HTML body
 */
const createPasswordResetEmail = (resetUrl) => {
  return {
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #306998;">Reset Your Password</h2>
        <p>You are receiving this because you (or someone else) requested a password reset for your account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #306998; 
                  color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="background-color: #f4f4f4; padding: 10px; border-radius: 4px;">
          ${resetUrl}
        </p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #666; font-size: 12px;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    `,
  };
};

/**
 * Build the HTML email for a support-form submission.
 *
 * @param   {Object} params
 * @param   {string} params.name
 * @param   {string} params.email
 * @param   {string} params.category       - Raw slug ("bug", "feature", ...)
 * @param   {string} params.subject
 * @param   {string} params.message
 * @param   {string|number} [params.moduleNumber]
 * @param   {string|number} [params.lessonNumber]
 * @returns {{ subject: string, html: string }}
 */
const createSupportRequestEmail = ({
  name,
  email,
  category,
  subject,
  message,
  moduleNumber,
  lessonNumber,
}) => {
  const categoryLabel = SUPPORT_CATEGORY_LABELS[category] || category;
  const emailSubject = `[Support] ${categoryLabel}: ${subject}`;

  let locationInfo = "";
  if (category === "bug" && (moduleNumber || lessonNumber)) {
    locationInfo = `Location: ${moduleNumber ? `Module ${moduleNumber}` : ""}${
      moduleNumber && lessonNumber ? ", " : ""
    }${lessonNumber ? `Lesson ${lessonNumber}` : ""}`;
  }

  const html = `
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

  return { subject: emailSubject, html };
};

module.exports = { createPasswordResetEmail, createSupportRequestEmail };
