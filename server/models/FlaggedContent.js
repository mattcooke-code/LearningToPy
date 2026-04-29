const mongoose = require("mongoose");

const flaggedContentSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ["LESSON", "EXERCISE", "QUIZ"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issueType: {
      type: String,
      enum: [
        "CONTENT_ERROR", // Typo, incorrect information
        "CODE_ERROR", // Exercise code not working
        "QUIZ_ERROR", // Quiz marked incorrectly
        "BROKEN_FUNCTIONALITY", // Validation not working
        "XP_ADJUSTMENT", // XP not awarded correctly
        "OTHER",
      ],
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [200, "Title must not exceed 200 characters"],
      minlength: [5, "Title must be at least 5 characters"],
      trim: true,
      validate: {
        validator: function(value) {
          // Prevent script injection in title
          return !/<script|javascript:|on\w+=/i.test(value);
        },
        message: "Title contains invalid content"
      }
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description must not exceed 2000 characters"],
      minlength: [10, "Description must be at least 10 characters"],
      trim: true,
      validate: {
        validator: function(value) {
          // Prevent script injection in description
          return !/<script|javascript:|on\w+=/i.test(value);
        },
        message: "Description contains invalid content"
      }
    },
    suggestedFix: {
      type: String,
      maxlength: [1000, "Suggested fix must not exceed 1000 characters"],
      trim: true,
      validate: {
        validator: function(value) {
          if (!value) return true; // Optional field
          // Prevent script injection in suggested fix
          return !/<script|javascript:|on\w+=/i.test(value);
        },
        message: "Suggested fix contains invalid content"
      }
    },
    status: {
      type: String,
      enum: ["PENDING", "IN_REVIEW", "FIXED", "REJECTED", "XP_ADJUSTED"],
      default: "PENDING",
    },
    adminResponse: {
      type: String,
      maxlength: [1000, "Admin response must not exceed 1000 characters"],
      trim: true,
      validate: {
        validator: function(value) {
          if (!value) return true; // Optional field
          // Prevent script injection in admin response
          return !/<script|javascript:|on\w+=/i.test(value);
        },
        message: "Admin response contains invalid content"
      }
    },
    xpCompensation: {
      type: Number,
      default: 0,
      min: 0,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Indexes for efficient queries
flaggedContentSchema.index({ status: 1, createdAt: -1 });
flaggedContentSchema.index({ targetType: 1, targetId: 1 });
flaggedContentSchema.index({ reporterId: 1 });

module.exports = mongoose.model("FlaggedContent", flaggedContentSchema);
