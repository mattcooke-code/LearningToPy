// routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const {
  validateUserRegistration,
  validatePasswordReset,
  validatePasswordResetConfirm,
  validateProfileUpdate,
  validatePasswordChange,
} = require("../middleware/validation");
const {
  authLimiter,
  passwordResetLimiter,
  apiLimiter,
} = require("../middleware/rateLimiter");

// === PUBLIC ROUTES ===
router.post(
  "/register",
  authLimiter,
  validateUserRegistration,
  authController.register,
);

router.post("/login", authLimiter, authController.login);

router.post("/refresh-token", authController.refreshToken);

router.post(
  "/forgot-password",
  passwordResetLimiter,
  validatePasswordReset,
  authController.forgotPassword,
);

router.get("/validate-reset-token/:token", authController.validateResetToken);

router.post(
  "/reset-password",
  passwordResetLimiter,
  validatePasswordResetConfirm,
  authController.resetPassword,
);

// === AUTHENTICATED ROUTES ===
router.post("/logout", protect, authController.logout);

router.get("/user", protect, authController.getUser);

router.patch(
  "/privacy-settings",
  protect,
  authController.updatePrivacySettings,
);

router.post(
  "/change-password",
  protect,
  validatePasswordChange,
  authController.changePassword,
);

router.post("/flags", protect, authController.createFlag);

router.delete("/delete-account", protect, authController.deleteAccount);

router.get("/export-data", protect, authController.exportUserData);

router.patch("/cookie-consent", protect, authController.updateCookieConsent);

// === EXPORT ===
module.exports = router;
