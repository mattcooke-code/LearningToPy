const { sendEmail } = require("../services/mailer");
const config = require("../config/envConfig");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { sendJsonResponse } = require("../utils/responseHelpers");

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

  if (!name || !email || !category || !subject || !message) {
    return next(new AppError("Please fill in all required fields", 400));
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError("Please provide a valid email address", 400));
  }

  const categoryMap = {
    help: "Technical Help",
    feedback: "Course Feedback",
    bug: "Bug Report",
    feature: "Feature Request",
    other: "Other",
  };

  const categoryLabel = categoryMap[category] || category;
  const emailSubject = `[Support] ${categoryLabel}: ${subject}`;

  let locationInfo = "";
  if (category === "bug" && (moduleNumber || lessonNumber)) {
    locationInfo = `Location: ${moduleNumber ? `Module ${moduleNumber}` : ""}${moduleNumber && lessonNumber ? ", " : ""}${lessonNumber ? `Lesson ${lessonNumber}` : ""}`;
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

  const supportEmail = process.env.SUPPORT_EMAIL;
  if (!supportEmail) {
    console.log("📝 Support message received (no SUPPORT_EMAIL configured):", {
      name,
      email,
      subject,
      message,
    });
    return sendJsonResponse(res, 200, "Your message has been received.", {
      received: true,
      timestamp: new Date().toISOString(),
    });
  }

  await sendEmail(supportEmail, emailSubject, emailHtml, {
    from: config.getEmailFrom(),
    replyTo: email,
  });

  sendJsonResponse(
    res,
    200,
    "Your message has been sent. We'll get back to you soon!",
    {
      received: true,
      timestamp: new Date().toISOString(),
    },
  );
});

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

module.exports = { sendSupportMessage, escapeHtml };
