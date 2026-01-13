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
    quizAttempts: [
      {
        moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
        attemptedAt: { type: Date, default: Date.now },
        score: Number,
        passed: Boolean,
        answers: [
          {
            questionId: mongoose.Schema.Types.ObjectId,
            question: String,
            userAnswer: String,
            correctAnswer: String,
            isCorrect: Boolean,
            explanation: String,
          },
        ],
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
    lastActive: {
      type: Date,
      default: Date.now,
    },
    totalLearningTime: { type: Number, default: 0 },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    suspensionEnd: Date,
    suspensionReason: String,
    isBlocked: {
      type: Boolean,
      default: false,
    },
    privacySettings: {
      showOnLeaderboards: { type: Boolean, default: true },
      showUsernameOnLeaderboards: { type: Boolean, default: false },
      showAsAnonymous: { type: Boolean, default: false },
    },
    loginCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSessionTime: {
      // in minutes
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
UserSchema.index({ xp: 1 });
UserSchema.index({ level: 1 });
UserSchema.index({ completedLessons: 1 });
UserSchema.index({ completedModules: 1 });
UserSchema.index({ isAdmin: 1 });
UserSchema.index({ isBlocked: 1 });
UserSchema.index({ lastActive: -1 });
UserSchema.index({ createdAt: -1 });

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
    this.lastActive = new Date();
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

// Add virtuals for calculated fields
UserSchema.virtual("badgesCount").get(function () {
  return this.badges?.length || 0;
});

UserSchema.virtual("completedLessonsCount").get(function () {
  return this.completedLessons?.length || 0;
});

UserSchema.virtual("completedModulesCount").get(function () {
  return this.completedModules?.length || 0;
});

UserSchema.virtual("totalLearningHours").get(function () {
  return (this.totalLearningTime || 0) / 3600; // Convert seconds to hours
});

UserSchema.virtual("totalSessionHours").get(function () {
  return (this.totalSessionTime || 0) / 60; // Convert minutes to hours
});

UserSchema.virtual("avgSessionMinutes").get(function () {
  return this.loginCount > 0
    ? (this.totalSessionTime / this.loginCount).toFixed(1)
    : 0;
});

// Enable virtuals in toJSON and toObject
UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("User", UserSchema);
