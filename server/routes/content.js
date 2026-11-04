// server/routes/content.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { trackActivity } = require("../middleware/activityTracker");
const contentController = require("../controllers/contentController");
const imageController = require("../controllers/imageController");

// === IMAGE ROUTE (MUST BE FIRST - before :moduleId routes) ===
// Images should be publicly accessible for rendering
router.get(
  "/modules/:moduleId/images/:imageName",
  imageController.serveModuleImage,
);

// === AUTHENTICATED ROUTES ===
router.get("/modules", protect, contentController.getAllModules);
router.get("/modules/:moduleId", protect, contentController.getModule);
router.get(
  "/modules/:moduleId/lessons",
  protect,
  contentController.getModuleLessons,
);
router.get("/lessons/:lessonId", protect, contentController.getLessonContent);
router.post(
  "/lessons/:lessonId/submit",
  protect,
  trackActivity("LESSON_COMPLETE"),
  contentController.submitLesson,
);

router.post(
  "/modules/:moduleId/submit-quiz",
  protect,
  trackActivity("MODULE_QUIZ_SUBMIT"),
  contentController.submitModuleQuiz,
);

module.exports = router;
