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
} = require("../middleware/validation");

// === PUBLIC ROUTES ===
router.post("/register", validateUserRegistration, authController.register);

router.post("/login", authController.login);

router.post("/refresh-token", authController.refreshToken);

router.post("/forgot-password", validatePasswordReset, authController.forgotPassword);

router.get("/validate-reset-token/:token", authController.validateResetToken);

router.post("/reset-password", validatePasswordResetConfirm, authController.resetPassword);

// === AUTHENTICATED ROUTES ===
router.post("/logout", protect, authController.logout);

router.get("/user", protect, authController.getUser);

router.patch(
  "/privacy-settings",
  protect,
  authController.updatePrivacySettings,
);

router.post("/flags", protect, authController.createFlag);

// In auth.js routes - add debug route
router.get("/debug/token", protect, (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const decoded = jwt.verify(token, authUtils.getAccessTokenSecret());
    res.json({
      tokenContent: decoded,
      user: {
        id: req.user._id,
        username: req.user.username,
        isAdmin: req.user.isAdmin,
      },
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// === EXPORT ===
module.exports = router;
