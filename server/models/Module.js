// Module.js
const mongoose = require("mongoose");

const ModuleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Module title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Module description is required"],
    },
    shortDescription: { type: String, maxLength: 150 },
    order: { type: Number, required: true, min: 1 },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    estimatedHours: { type: Number, default: 2, min: 0.5 },
    isPublished: { type: Boolean, default: false },
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
    learningObjectives: [String],
    icon: { type: String, default: "📚" },
    slug: { type: String, unique: true, index: true, trim: true },
    xpReward: { type: Number, default: 100, min: 0 },
    lessonCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// lessonCount Update
ModuleSchema.virtual("lessons", {
  ref: "Lesson",
  localField: "_id",
  foreignField: "moduleId",
});

ModuleSchema.set("toJSON", { virtuals: true });
ModuleSchema.set("toObject", { virtuals: true });

ModuleSchema.pre("save", async function (next) {
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
  const ModuleModel = this.constructor;

  while (
    await ModuleModel.exists({
      slug: candidate,
      _id: { $ne: this._id },
    })
  ) {
    candidate = `${baseSlug}-${suffix++}`;
  }

  this.slug = candidate;
  next();
});

module.exports = mongoose.model("Module", ModuleSchema);
