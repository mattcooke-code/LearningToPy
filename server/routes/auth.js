// routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// === PUBLIC ROUTES ===
router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/refresh-token", authController.refreshToken);

// === AUTHENTICATED ROUTES ===
router.post("/logout", protect, authController.logout);

router.get("/me", protect, authController.getMe);

// === EXPORT ===
module.exports = router;
