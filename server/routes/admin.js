// admin.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const analyticsController = require("../controllers/analyticsController");
const { adminOnly } = require("../middleware/adminOnly");
const { protect } = require("../middleware/auth");

router.use(protect);
router.use(adminOnly);

// Admin user management
router.patch("/users/:userId/admin-status", adminController.toggleAdminStatus);
router.get("/admins", adminController.getAdmins);
router.get("/users/search", adminController.searchUsers);
router.get("/users/:userId", adminController.getUserDetails);
router.patch("/users/:userId/xp", adminController.adjustUserXp);
router.patch("/users/:userId/status", adminController.updateUserStatus);
router.get("/users/:userId/activity", adminController.getUserActivity);
router.get("/users/:userId/progress", adminController.getUserProgress);
router.patch("/users/:userId/progress", adminController.overrideUserProgress);

// Dashboard Stats
router.get("/stats", adminController.getAdminStats);
router.get("/stats/flags", adminController.getFlagStats);

// Content management
router.get("/content/lessons", adminController.getAllLessons);
router.get("/content/modules", adminController.getAllModules);
router.get("/content/stats", adminController.getContentStats);

// Lesson routes
router.post("/content/lessons", adminController.createLesson);
router.patch("/content/lessons/:lessonId", adminController.updateLesson);
router.patch(
  "/content/lessons/:lessonId/publish",
  adminController.publishLesson,
);
router.patch(
  "/content/lessons/:lessonId/order",
  adminController.updateLessonOrder,
);
router.post(
  "/content/lessons/:lessonId/duplicate",
  adminController.duplicateLesson,
);
router.delete("/content/lessons/:lessonId/", adminController.deleteLesson);

// Module routes
router.post("/content/modules", adminController.createModule);
router.patch("/content/modules/:moduleId", adminController.updateModule);
router.patch(
  "/content/modules/:moduleId/publish",
  adminController.publishModule,
);
router.patch(
  "/content/modules/:moduleId/order",
  adminController.updateModuleOrder,
);
router.post(
  "/content/modules/:moduleId/duplicate",
  adminController.duplicateModule,
);
router.delete("/content/modules/:moduleId", adminController.deleteModule);

// Badge management
router.get("/users/:userId/badges", adminController.getUserBadges);
router.post("/users/:userId/badges/award", adminController.awardBadges);
router.post("/users/:userId/badges/remove", adminController.removeBadges);

// Flagged content
router.get("/flagged", adminController.getFlaggedContent);
router.patch("/flagged/:flagId/resolve", adminController.resolveFlag);

// Activity logs
router.get("/activity-logs", adminController.getActivityLogs);

// Settings
router.get("/settings", adminController.getSettings);
router.patch("/settings", adminController.updateSettings);

// Analytics
router.get("/analytics", analyticsController.getPlatformAnalytics);
router.get(
  "/analytics/content/:contentId",
  analyticsController.getContentAnalytics,
);
router.get("/analytics/users/:userId", analyticsController.getUserAnalytics);

module.exports = router;
