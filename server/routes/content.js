// server/routes/content.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const contentController = require("../controllers/contentController");

// === AUTHENTICATED ROUTES ===
router.get("/modules", protect, contentController.getAllModules);
router.get(
  "/modules/:moduleId/lessons",
  protect,
  contentController.getModuleLessons
);
router.get("/lessons/:lessonId", protect, contentController.getLessonContent);
router.post(
  "/lessons/:lessonId/submit",
  protect,
  contentController.submitLesson
);

router.get("/fix-progress", contentController.fixModuleProgress);

module.exports = router;
