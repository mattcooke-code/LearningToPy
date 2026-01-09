// server/models/Lesson.js
const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
    },
    content: { type: String, required: [true, "Lesson content is required"] },
    shortDescription: { type: String, maxLength: 150 },
    order: { type: Number, required: true, min: 1 },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
      index: true, // Added for faster queries when loading a module's lessons
    },
    xpReward: { type: Number, default: 25, min: 0 },
    duration: { type: Number, default: 15, min: 1 },
    contentType: {
      type: String,
      enum: ["theory", "exercise", "quiz", "project", "guided-setup"],
      default: "theory",
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    tags: [{ type: String, trim: true }],
    challengeGroup: { type: String, trim: true },
    codeExample: { language: String, code: String, explanation: String },
    // Ensure your L1_Exercise.json files follow this structure
    exercise: {
      instructions: String,
      starterCode: String,
      solution: String,
      hints: [String],
      testCases: [mongoose.Schema.Types.Mixed], // Flexible for various testing styles
    },
    quiz: [
      {
        id: String,
        type: { type: String, default: "multiple-choice" },
        question: { type: String, required: true },
        options: [String],
        correctAnswer: Number,
        explanation: String,
      },
    ],
    isPublished: { type: Boolean, default: false },
    slug: { type: String, unique: true, index: true },
    nextLessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
    },
  },
  { timestamps: true }
);

// Improved slug middleware with uniqueness check (consistent with Module.js)
LessonSchema.pre("save", async function (next) {
  if (!this.isModified("title") && this.slug) {
    return next();
  }

  const baseSlug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  let candidate = baseSlug;
  let suffix = 1;
  const LessonModel = this.constructor;

  // Check for uniqueness across the whole collection
  while (
    await LessonModel.exists({ slug: candidate, _id: { $ne: this._id } })
  ) {
    candidate = `${baseSlug}-${suffix++}`;
  }

  this.slug = candidate;
  next();
});

module.exports = mongoose.model("Lesson", LessonSchema);
