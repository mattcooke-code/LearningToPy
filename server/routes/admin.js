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

// Dashboard Stats
router.get("/stats", adminController.getAdminStats);
router.get("/stats/flags", adminController.getFlagStats);

// User Management
router.get("/users/search", adminController.searchUsers);
router.get("/users/:userId", adminController.getUserDetails);
router.patch("/users/:userId/xp", adminController.adjustUserXp);
router.patch("/users/:userId/status", adminController.updateUserStatus);
router.get("/users/:userId/activity", adminController.getUserActivity);
router.patch("/users/:userId/progress", adminController.overrideUserProgress);

// Content management
router.get("/content/lessons", adminController.getAllLessons);
router.get("/content/modules", adminController.getAllModules);
router.patch("/content/lessons/:lessonId", adminController.updateLesson);
router.patch("/content/modules/:moduleId", adminController.updateModule);
//router.patch("/content/:type/:id/publish", adminController.togglePublish);

// Badge management
//router.post("/badges/grant", adminController.grantBadge);
//router.delete("/badges/revoke/:badgeId", adminController.revokeBadge);

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

module.exports = router;
