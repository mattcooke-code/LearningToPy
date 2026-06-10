const mongoose = require("mongoose");
const { generateUniqueSlug } = require("../utils/generalUtils");

const ModuleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Module title is required"],
      trim: true,
      minlength: [3, "Module title must be at least 3 characters"],
      maxlength: [100, "Module title must not exceed 100 characters"],
      validate: {
        validator: function (value) {
          // Prevent script injection in titles
          return !/<script|javascript:|on\w+=/i.test(value);
        },
        message: "Title contains invalid content",
      },
    },
    description: {
      type: String,
      required: [true, "Module description is required"],
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description must not exceed 2000 characters"],
      validate: {
        validator: function (value) {
          // Basic XSS prevention
          return !/<script|javascript:|on\w+=/i.test(value);
        },
        message: "Description contains invalid content",
      },
    },
    shortDescription: { type: String, maxLength: 150 },
    order: { type: Number, min: 0 },
    moduleNumber: { type: String, unique: true },
    difficulty: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
      default: "BEGINNER",
      uppercase: true,
      required: true,
    },
    estimatedHours: { type: Number, default: 2, min: 0.5 },
    isPublished: { type: Boolean, default: false },
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
    learningObjectives: [String],
    icon: { type: String, default: "📚" },
    slug: { type: String, unique: true, index: true, trim: true },
    xpReward: {
      type: Number,
      default: 100,
      min: [0, "XP reward cannot be negative"],
      max: [1000, "XP reward cannot exceed 1000"],
      validate: {
        validator: Number.isInteger,
        message: "XP reward must be an integer",
      },
    },
    lessonCount: { type: Number, default: 0 },
    // Updated to handle the nested JSON structure from seeders
    moduleQuiz: {
      title: { type: String, default: "Module Review Quiz" },
      description: String,
      settings: {
        randomizeQuestionOrder: { type: Boolean, default: true },
        randomizeAnswerOrder: { type: Boolean, default: true },
        passingScore: { type: Number, default: 70 },
      },
      // The questions are now nested inside the quiz object
      questions: [
        {
          id: String,
          sourceLesson: String,
          type: { type: String, default: "multiple-choice" },
          question: { type: String, required: true },
          options: [String],
          correctAnswer: Number, // Index of the correct option
          explanation: String,
        },
      ],
    },
  },
  { timestamps: true },
);

// --- Virtuals for Lesson Association ---
ModuleSchema.virtual("lessons", {
  ref: "Lesson",
  localField: "_id",
  foreignField: "moduleId",
});

// Virtual to get the count of associated lessons automatically
ModuleSchema.virtual("calculatedLessonCount").get(function () {
  return this.lessons ? this.lessons.length : 0;
});

ModuleSchema.set("toJSON", { virtuals: true });
ModuleSchema.set("toObject", { virtuals: true });

// --- Slug Generation Middleware ---
ModuleSchema.pre("save", async function (next) {
  if (!this.isModified("title") && this.slug) return next();
  this.slug = await generateUniqueSlug(this.constructor, this.title, this._id);
  next();
});

// --- Auto-generate order and moduleNumber for new modules ---
ModuleSchema.pre("save", async function (next) {
  // Only run for new modules
  if (!this.isNew) {
    return next();
  }

  // Skip auto-generation if both order and moduleNumber are already set
  if (this.order !== undefined && this.order !== null && this.moduleNumber) {
    return next();
  }

  try {
    const ModuleModel = this.constructor;

    // Find the highest order number (excluding tutorial module with order 0)
    const lastModule = await ModuleModel.findOne({ order: { $gt: 0 } })
      .sort({ order: -1 })
      .select("order");

    // Determine the new order
    let newOrder;
    if (this.order !== undefined && this.order !== null) {
      // If order is explicitly set, use it
      newOrder = this.order;
    } else {
      // Auto-generate: start from 1 if no modules, otherwise last order + 1
      newOrder = (lastModule?.order || 0) + 1;
    }

    // Set the order
    this.order = newOrder;

    // Auto-generate moduleNumber if not provided
    if (!this.moduleNumber) {
      // Tutorial module (order 0) gets M0
      if (newOrder === 0) {
        this.moduleNumber = "M0";
      } else {
        this.moduleNumber = `M${newOrder}`;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Module", ModuleSchema);
