// progress.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  trackActivity,
  addActivityMetadata,
} = require("../middleware/activityTracker");
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

router.post(
  "/modules/:moduleId/complete",
  protect,
  progressController.completeModule,
);
router.post("/streak", protect, progressController.checkStreak);

router.post(
  "/lessons/:lessonId/complete",
  protect,
  addActivityMetadata({ xpEarned: 100 }),
  trackActivity("LESSON_COMPLETE"),
  progressController.completeLesson,
);

router.post(
  "/lessons/:lessonId/start",
  protect,
  trackActivity("LESSON_START"),
  progressController.startLesson,
);

// === EXPORT ===
module.exports = router;
