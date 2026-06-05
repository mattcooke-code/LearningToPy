// models/ModuleCompletion.js
const mongoose = require("mongoose");

const ModuleCompletionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────────────
// Prevent duplicate completions
ModuleCompletionSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

// Query completions by date
ModuleCompletionSchema.index({ userId: 1, completedAt: -1 });

// Level calculation: count completed modules per user
ModuleCompletionSchema.index({ userId: 1 });

module.exports = mongoose.model("ModuleCompletion", ModuleCompletionSchema);
