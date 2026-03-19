// scripts/backfillLessonCompletions.js
const mongoose = require("mongoose");
const path = require("path");
const User = require("../models/User");
const Lesson = require("../models/Lesson");
const Activity = require("../models/ActivityLog");

// Load environment variables - FIXED PATH
require("dotenv").config({
  path: path.resolve(__dirname, "../.env.development"),
});

// Debug: Check if env loaded
console.log("🔍 Environment Check:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log(
  "MONGODB_URI:",
  process.env.MONGODB_URI ? "✅ Found" : "❌ Missing",
);
console.log("Current directory:", __dirname);

const backfillCompletions = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get all users with their completed lessons
    const users = await User.find({
      completedLessons: { $exists: true, $ne: [] },
    }).select("username completedLessons createdAt");

    console.log(`📊 Found ${users.length} users with completed lessons`);

    let totalCreated = 0;
    let totalSkipped = 0;

    for (const user of users) {
      console.log(
        `\n👤 Processing user: ${user.username} (${user.completedLessons.length} lessons)`,
      );

      for (const lessonId of user.completedLessons) {
        // Check if activity already exists
        const existing = await Activity.findOne({
          userId: user._id,
          actionType: "LESSON_COMPLETE",
          "metadata.lessonId": lessonId,
        });

        if (!existing) {
          // Create a completion event
          await Activity.create({
            userId: user._id,
            actionType: "LESSON_COMPLETE",
            sessionId: `backfill-${Date.now()}-${Math.random()}`,
            metadata: {
              lessonId: lessonId,
              backfilled: true,
              deviceInfo: {
                platform: "backfilled",
                userAgent: "backfill-script",
                isMobile: false,
              },
            },
            timestamp: user.createdAt || new Date(),
          });
          totalCreated++;
          process.stdout.write("."); // Progress indicator
        } else {
          totalSkipped++;
        }
      }
    }

    console.log(`\n\n✅ Created ${totalCreated} new activity records`);
    console.log(`⏭️  Skipped ${totalSkipped} existing records`);

    // Verify the data
    const counts = await Activity.aggregate([
      { $group: { _id: "$actionType", count: { $sum: 1 } } },
    ]);

    console.log("\n📊 Activity counts after backfill:");
    if (counts.length > 0) {
      console.table(counts);
    } else {
      console.log(
        "No activities found. Check if the Activity model is correct.",
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

backfillCompletions();
