// /routes/cron.js
const express = require("express");
const router = express.Router();
const cronAuth = require("../middleware/cronAuth");
const {
  hofTransition,
  inactivityCleanup,
} = require("../controllers/cronController");

// Both routes protected by CRON_SECRET
router.post("/hof-transition", cronAuth, hofTransition);
router.post("/inactivity-cleanup", cronAuth, inactivityCleanup);

module.exports = router;
