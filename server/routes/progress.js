// progress.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const progressController = require("../controllers/progressController");

// === AUTHENTICATED ROUTES ===
router.get("/current", protect, progressController.getCurrentProgress);

router.get("/achievements", protect, progressController.getAchievements);

router.get(
  "/leaderboard/around-me",
  protect,
  progressController.getSurroundingLeaderboard,
);

router.get("/leaderboard/top", protect, progressController.getTopLeaderboard);

router.get(
  "/leaderboard/module/:moduleId",
  protect,
  progressController.getModuleLeaderboard,
);

router.get("/hall-of-fame", protect, progressController.getHallOfFame);

router.get(
  "/course-completion",
  protect,
  progressController.getCourseCompletionStatus,
);

router.post(
  "/hall-of-fame/opt-in",
  protect,
  progressController.optInToHallOfFame,
);

router.post("/streak", protect, progressController.checkStreak);

// === EXPORT ===
module.exports = router;
