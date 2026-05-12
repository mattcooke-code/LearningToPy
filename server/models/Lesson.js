// server/models/Lesson.js
const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
      minlength: [3, "Lesson title must be at least 3 characters"],
      maxlength: [100, "Lesson title must not exceed 100 characters"],
      validate: {
        validator: function (value) {
          // Prevent script injection in titles
          return !/<script|javascript:|on\w+=/i.test(value);
        },
        message: "Title contains invalid content",
      },
    },
    content: {
      type: String,
      required: [true, "Lesson content is required"],
      minlength: [10, "Content must be at least 10 characters"],
      maxlength: [50000, "Content must not exceed 50000 characters"],
      validate: {
        validator: function (value) {
          // Basic XSS prevention for content
          return !/<script[^>]*>.*?<\/script>/gi.test(value);
        },
        message: "Content contains invalid script tags",
      },
    },
    shortDescription: { type: String, maxLength: 150 },
    order: { type: Number, required: true, min: 1 },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
      index: true, // Added for faster queries when loading a module's lessons
    },
    xpReward: {
      type: Number,
      default: 25,
      min: [0, "XP reward cannot be negative"],
      max: [500, "XP reward cannot exceed 500"],
      validate: {
        validator: Number.isInteger,
        message: "XP reward must be an integer",
      },
    },
    duration: { type: Number, default: 15, min: 1 },
    contentType: {
      type: String,
      enum: ["THEORY", "EXERCISE", "QUIZ", "PROJECT", "GUIDED_SETUP"],
      default: "THEORY",
      uppercase: true,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
      default: "BEGINNER",
      uppercase: true,
      required: true,
    },
    tags: [{ type: String, trim: true }],
    challengeGroup: { type: String, trim: true },
    codeExample: { language: String, code: String, explanation: String },
    // Ensure your L1_Exercise.json files follow this structure
    exercise: {
      title: String,
      instructions: String,
      steps: [String],
      starterCode: String,
      solution: String,
      hints: [String],
      testCases: [mongoose.Schema.Types.Mixed],
      validation: {
        type: String,
        enum: ["TESTS", "OUTPUT", "NONE"],
        uppercase: true,
        default: "NONE",
      },
      tests: [mongoose.Schema.Types.Mixed],
      expectedOutput: String,
      tags: [String],
      challengeGroup: String,
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
  { timestamps: true },
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
