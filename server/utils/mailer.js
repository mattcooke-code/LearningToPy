// server/utils/mailer.js
const nodemailer = require("nodemailer");
const config = require("../config/envConfig");
const AppError = require("./AppError");

const createTransporter = async () => {
  // Development with no email config - use Ethereal
  if (config.isDevelopment() && !config.getEmailUser()) {
    const testAccount = await nodemailer.createTestAccount();
    console.log("\n📧 Using Ethereal Email for testing:");
    console.log(`   Preview URL: ${testAccount.web}`);
    console.log(`   Username: ${testAccount.user}`);
    console.log(`   Password: ${testAccount.pass}\n`);

    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
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

  return nodemailer.createTransport(emailConfig);
};

let transporterPromise = null;

const getTransporter = () => {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }
  return transporterPromise;
};

const sendEmail = async (to, subject, htmlContent) => {
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
      from: config.getEmailFrom(),
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

module.exports = {
  sendEmail,
  createPasswordResetEmail,
  getTransporter,
};
