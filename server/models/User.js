// models/User.js
const mongoose = require("mongoose");
const { validatePassword } = require("../utils/validationHelpers");

const UserSchema = new mongoose.Schema(
  {
    // ── Auth ──────────────────────────────────────────
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username must not exceed 30 characters"],
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
      validate: {
        validator: function (value) {
          const reserved = new Set([
            "admin",
            "root",
            "system",
            "api",
            "www",
            "mail",
            "support",
            "null",
            "undefined",
          ]);
          return !reserved.has(value.toLowerCase());
        },
        message: "Username is reserved",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please use a valid email address",
      ],
      validate: {
        validator: function (value) {
          const domain = value.split("@")[1]?.toLowerCase();
          if (!domain) return false;
          const blockedDomains = new Set([
            "tempmail.com",
            "10minutemail.com",
            "guerrillamail.com",
            "mailinator.com",
          ]);
          return !blockedDomains.has(domain);
        },
        message: "Disposable email addresses are not allowed",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      validate: {
        validator: (v) => validatePassword(v).isValid,
        message: () => "Password does not meet strength requirements.",
      },
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    refreshTokenVersion: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Age Verification ──────────────────────────────
    ageVerified: {
      type: Boolean,
      default: false,
    },
    ageVerifiedAt: {
      type: Date,
      default: null,
    },
    ageBracket: {
      type: String,
      enum: ["13-15", "16-17", "18+"],
      required: true,
      select: false,
    },
    parentalConsentConfirmed: {
      type: Boolean,
      default: false,
    },

    // ── Progress (denormalised counters for fast reads) ──
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
    completedLessonsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedModulesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Streak ────────────────────────────────────────
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
    lastActiveDate: {
      type: Date,
      default: null,
    },
    lastCompletionDate: {
      type: Date,
      default: null,
    },
    weeklyProgress: {
      weekStartDate: { type: Date, default: null },
      daysActive: { type: Number, default: 0, min: 0 },
      completionsThisWeek: { type: Number, default: 0, min: 0 },
      warningIssued: { type: Boolean, default: false },
      warningDay: { type: Number, default: 5 },
    },

    // ── Gamification ──────────────────────────────────
    badges: {
      type: [String],
      default: [],
    },
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
      oopExamScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      bugReportsVerified: { type: Number, default: 0, min: 0 },
      helpfulVotesReceived: { type: Number, default: 0, min: 0 },
      referralsCompleted: { type: Number, default: 0, min: 0 },
      betaModulesCompleted: { type: Number, default: 0, min: 0 },
    },

    // ── Activity Metadata ─────────────────────────────
    lastActive: {
      type: Date,
      default: Date.now,
    },
    totalLearningTime: {
      type: Number,
      default: 0,
    },
    totalSessionTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    loginCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Admin / Status ────────────────────────────────
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    suspensionEnd: Date,
    suspensionReason: String,

    // ── Privacy ───────────────────────────────────────
    privacySettings: {
      showOnLeaderboards: { type: Boolean, default: true },
      showUsernameOnLeaderboards: { type: Boolean, default: false },
      showAsAnonymous: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────────────

// Compound indexes for actual query patterns
UserSchema.index({ level: -1, xp: -1 }); // Leaderboards
UserSchema.index({ isAdmin: 1, lastActive: -1 }); // Admin user listing
UserSchema.index({ isBlocked: 1, createdAt: -1 }); // Blocked user audit
UserSchema.index({ lastActiveDate: -1 }); // Streak checks
UserSchema.index({ "weeklyProgress.weekStartDate": -1 }); // Weekly reset queries

// ── Pre-save Hook ─────────────────────────────────────
UserSchema.pre("save", function (next) {
  // Only update lastActive when progress-related fields change
  if (
    this.isNew ||
    this.isModified("xp") ||
    this.isModified("streak") ||
    this.isModified("completedLessonsCount") ||
    this.isModified("completedModulesCount")
  ) {
    this.lastActive = new Date();
  }
  next();
});

// ── Statics ───────────────────────────────────────────
UserSchema.statics.findByCredential = function (credential) {
  const normalized = credential.toLowerCase();
  return this.findOne({
    $or: [{ email: normalized }, { username: normalized }],
  }).select("+password");
};

// ── Virtuals ──────────────────────────────────────────
UserSchema.virtual("totalLearningHours").get(function () {
  return (this.totalLearningTime || 0) / 3600;
});

UserSchema.virtual("totalSessionHours").get(function () {
  return (this.totalSessionTime || 0) / 60;
});

UserSchema.virtual("avgSessionMinutes").get(function () {
  return this.loginCount > 0
    ? (this.totalSessionTime / this.loginCount).toFixed(1)
    : 0;
});

// Enable virtuals in JSON output
UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("User", UserSchema);
