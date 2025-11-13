// progress.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const progressController = require("../controllers/progressController");

// === AUTHENTICATED ROUTES ===
router.get("/current", protect, progressController.getCurrentProgress);

router.get("/achievements", protect, progressController.getAchievements);

// === EXPORT ===
module.exports = router;
