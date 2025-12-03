// User.js

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username must not exceed 30 characters"],
      trim: true,
      lowercase: true, // Normalize usernames to lowercase
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true, // Normalize emails to lowercase
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Exclude password from queries by default
    },
    // --- AUTHENTICATION FIELD CHANGE START ---
    refreshTokenVersion: {
      // <-- NEW FIELD: Used to instantly revoke tokens
      type: Number,
      default: 0,
      min: 0,
    },
    // --- AUTHENTICATION FIELD CHANGE END ---
    level: {
      type: Number,
      default: 1,
      min: [1, "Level cannot be less than 1"],
    },
    xp: {
      type: Number,
      default: 0,
      min: [0, "XP cannot be negative"],
    },
    streak: {
      type: Number,
      default: 0,
      min: [0, "Streak cannot be negative"],
    },
    badges: {
      type: [String],
      default: [],
    },
    completedModules: {
      type: [String],
      default: [],
    },
    completedLessons: {
      type: [String],
      default: [],
    },
    moduleCompletionHistory: [
      {
        moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
        completedAt: { type: Date, default: Date.now },
      },
    ],
    lessonCompletionHistory: [
      {
        lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
        completedAt: { type: Date, default: Date.now },
        tags: [{ type: String, trim: true }],
        contentType: { type: String, trim: true },
        difficulty: { type: String, trim: true },
        challengeGroup: { type: String, trim: true },
        elapsedSeconds: { type: Number, min: 0 },
        attemptNumber: { type: Number, min: 1 },
        usedHints: { type: Boolean, default: false },
        linesOfCode: { type: Number, min: 0 },
        wasOptimal: { type: Boolean, default: false },
      },
    ],
    stats: {
      fastChallengeCount: { type: Number, default: 0, min: 0 },
      firstTryChallengeCount: { type: Number, default: 0, min: 0 },
      optimalSolutionCount: { type: Number, default: 0, min: 0 },
      functionChallengeCount: { type: Number, default: 0, min: 0 },
      apiChallengeCount: { type: Number, default: 0, min: 0 },
      fileChallengeCount: { type: Number, default: 0, min: 0 },
      regexChallengeCount: { type: Number, default: 0, min: 0 },
      dataStructuresExamScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      oopExamScore: { type: Number, min: 0, max: 100, default: null },
      bugReportsVerified: { type: Number, default: 0, min: 0 },
      helpfulVotesReceived: { type: Number, default: 0, min: 0 },
      referralsCompleted: { type: Number, default: 0, min: 0 },
      betaModulesCompleted: { type: Number, default: 0, min: 0 },
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
    totalLearningTime: { type: Number, default: 0 },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    // Removed the 'refreshTokens' array field as it's no longer used
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for better query performance
UserSchema.index({ xp: 1 });
UserSchema.index({ level: 1 });
UserSchema.index({ completedLessons: 1 });
UserSchema.index({ completedModules: 1 });

// Pre-save
UserSchema.pre("save", function (next) {
  if (this.isModified("xp")) {
    this.level = Math.floor(this.xp / 100) + 1;
  }
  const progressFields = [
    "xp",
    "completedLessons",
    "completedModules",
    "badges",
    "streak",
  ];

  if (progressFields.some((field) => this.isModified(field))) {
    this.lastActiveDate = new Date();
  }

  next();
});

// Static method to find user by email or username
UserSchema.statics.findByCredential = function (credential) {
  return this.findOne({
    $or: [
      { email: credential.toLowerCase() },
      { username: credential.toLowerCase() },
    ],
  }).select("+password");
};

module.exports = mongoose.model("User", UserSchema);
