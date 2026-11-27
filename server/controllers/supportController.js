// controllers/supportController.js
const catchAsync = require("../utils/catchAsync");
const { sendJsonResponse } = require("../utils/responseHelpers");
const supportService = require("../services/supportService");

/**
 * Handle a support-form submission.
 *
 * @route   POST /api/support
 * @body    {string} name
 * @body    {string} email
 * @body    {string} category  - "help" | "feedback" | "bug" | "feature" | "other"
 * @body    {string} subject
 * @body    {string} message
 * @body    {string|number} [moduleNumber]
 * @body    {string|number} [lessonNumber]
 * @returns {Object} 200 - { received, timestamp }
 * @returns {Object} 400 - Missing fields or invalid email
 */
const sendSupportMessage = catchAsync(async (req, res) => {
  const result = await supportService.sendSupportMessage(req.body);

  sendJsonResponse(res, 200, "Your message has been received.", result);
});

module.exports = { sendSupportMessage };
