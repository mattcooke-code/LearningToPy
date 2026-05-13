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
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
      validate: {
        validator: function (value) {
          // Prevent reserved usernames
          const reserved = [
            "admin",
            "root",
            "system",
            "api",
            "www",
            "mail",
            "support",
            "null",
            "undefined",
          ];
          return !reserved.includes(value.toLowerCase());
        },
        message: "Username is reserved",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true, // Normalize emails to lowercase
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please use a valid email address",
      ],
      validate: {
        validator: function (value) {
          // Prevent common disposable email domains
          const disposableDomains = [
            "tempmail.com",
            "10minutemail.com",
            "guerrillamail.com",
            "mailinator.com",
          ];
          const domain = value.split("@")[1]?.toLowerCase();
          return !disposableDomains.some((d) => domain?.includes(d));
        },
        message: "Disposable email addresses are not allowed",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      maxlength: [128, "Password must not exceed 128 characters"],
      select: false, // Exclude password from queries by default
      validate: {
        validator: function (value) {
          // Strong password validation
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
            value,
          );
        },
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
    },
    // --- AUTHENTICATION FIELD CHANGE START ---
    resetPasswordToken: String,
    resetPasswordExpires: Date,
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
    streakStatus: {
      type: String,
      enum: ["ACTIVE", "WARNING", "AT_RISK", "RESETTING"],
      default: "ACTIVE",
      uppercase: true,
    },
    // Streak only - different to lastActive
    lastActiveDate: { type: Date, default: null },
    lastCompletionDate: { type: Date, default: null },
    weeklyProgress: {
      weekStartDate: { type: Date, default: null },
      daysActive: { type: Number, default: 0, min: 0 },
      completionsThisWeek: { type: Number, default: 0, min: 0 },
      warningIssued: { type: Boolean, default: false },
      warningDay: { type: Number, default: 5 },
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
    lessonQuizProgress: [
      {
        lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
        questionAttempts: [
          {
            questionIndex: { type: Number, required: true },
            attempts: { type: Number, default: 1, min: 1 },
            correct: { type: Boolean, default: false },
          },
        ],
        correctAnswers: [{ type: Number }],
        completed: { type: Boolean, default: false },
        lastAttempt: { type: Date, default: Date.now },
      },
    ],
    xpHistory: [
      {
        amount: { type: Number, required: true, min: 0 },
        source: {
          type: String,
          enum: [
            "LESSON_COMPLETION",
            "LESSON_QUIZ",
            "EXERCISE",
            "MODULE_QUIZ",
            "MODULE_COMPLETION",
            "MODULE_COMPLETION_AUTO",
            "BONUS",
          ],
          uppercase: true,
          required: true,
        },
        meta: mongoose.Schema.Types.Mixed, // { lessonId, moduleId, attempts, etc. }
        awardedAt: { type: Date, default: Date.now },
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
  },
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
UserSchema.index({ streakStatus: 1 });
UserSchema.index({ lastActiveDate: -1 });
UserSchema.index({ lastCompletionDate: -1 });
UserSchema.index({ "weeklyProgress.weekStartDate": -1 });

// Pre-save
UserSchema.pre("save", function (next) {
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
