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
    lastActiveDate: {
      type: Date,
      default: null, // Track last activity for streak management
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },
        expiresAt: {
          type: Date,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for better query performance
UserSchema.index({ "refreshTokens.token": 1 }); // For token lookups
UserSchema.index({ "refreshTokens.expiresAt": 1 }); // For cleanup queries

// Method to clean up expired refresh tokens
UserSchema.methods.cleanExpiredTokens = function () {
  this.refreshTokens = this.refreshTokens.filter(
    (rt) => rt.expiresAt > new Date()
  );
  return this.save();
};

// Static method to find user by email or username
UserSchema.statics.findByCredential = function (credential) {
  return this.findOne({
    $or: [
      { email: credential.toLowerCase() },
      { username: credential.toLowerCase() },
    ],
  }).select("+password"); // Include password for authentication
};

module.exports = mongoose.model("User", UserSchema);
