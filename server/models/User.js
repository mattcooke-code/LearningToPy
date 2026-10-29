// User.js
const mongoose = require("mongoose");
const {
  validatePassword,
  validateUsername,
  validateEmail,
} = require("../utils/validationHelpers");

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
          return validateUsername(value).isValid;
        },
        message: function (props) {
          return validateUsername(props.value).message;
        },
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
          return validateEmail(value);
        },
        message: "Please provide a valid, non-disposable email address",
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
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
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
    streakLastCheckedDate: {
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
    leaderboardStatus: {
      type: String,
      enum: ["ACTIVE", "COMPLETED_PENDING", "HOF", "INACTIVE_REMOVED"],
      default: "ACTIVE",
    },

    // ── Activity Metadata ─────────────────────────────
    lastEngagementAt: {
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
    removedFromLeaderboardAt: { type: Date, default: null },

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

    // ── Privacy & Cookies ───────────────────────────────────────
    privacySettings: {
      showOnLeaderboards: { type: Boolean, default: false },
      showUsernameOnLeaderboards: { type: Boolean, default: false },
      showAsAnonymous: { type: Boolean, default: false },
    },
    cookieConsent: {
      type: String,
      enum: ["ACCEPTED", "DECLINED", null],
      default: null,
    },
    cookieConsentDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────────────

// Compound indexes for actual query patterns
UserSchema.index({ leaderboardStatus: 1, xp: -1 }); // Leaderboards
UserSchema.index({ leaderboardStatus: 1, lastEngagementAt: -1 });
UserSchema.index({ isAdmin: 1, lastEngagementAt: -1 }); // Admin user listing
UserSchema.index({ isBlocked: 1, createdAt: -1 }); // Blocked user audit
UserSchema.index({ streakLastCheckedDate: -1 }); // Streak checks
UserSchema.index({ "weeklyProgress.weekStartDate": -1 }); // Weekly reset queries

// ── Pre-save Hook ─────────────────────────────────────
UserSchema.pre("save", function (next) {
  // Only update lastEngagementAt when progress-related fields change
  if (
    this.isNew ||
    this.isModified("xp") ||
    this.isModified("streak") ||
    this.isModified("completedLessonsCount") ||
    this.isModified("completedModulesCount")
  ) {
    this.lastEngagementAt = new Date();
  }
  next();
});

// ── Statics ───────────────────────────────────────────
UserSchema.statics.findByCredential = function (credential) {
  if (!credential) {
    throw new Error("Credential is required for lookup");
  }
  const normalized = credential.toLowerCase();
  return this.findOne({
    $or: [{ email: normalized }, { username: normalized }],
  }).select("+password +ageBracket");
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
