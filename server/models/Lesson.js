// Lesson.js
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
    },
    xpReward: { type: Number, default: 25, min: 0 },
    duration: { type: Number, default: 15, min: 1 },
    contentType: {
      type: String,
      enum: ["theory", "exercise", "quiz", "project", "guided-setup"],
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    tags: [{ type: String, trim: true }],
    challengeGroup: { type: String, trim: true },
    codeExample: { language: String, code: String, explanation: String },
    exercise: {
      instructions: String,
      starterCode: String,
      solution: String,
      hints: [String],
    },
    quiz: {
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String,
    },
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

LessonSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
  next();
});

module.exports = mongoose.model("Lesson", LessonSchema);
