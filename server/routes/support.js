// support.js
const express = require("express");
const router = express.Router();
const supportController = require("../controllers/supportController");

router.post("/support", supportController.sendSupportMessage);

module.exports = router;
