// server/seeders/resetUserData.js (IMPROVED)
const mongoose = require("mongoose");
const User = require("../models/User");
const { getDatabaseUri, isProduction } = require("../config/envConfig");

const DB_URI = getDatabaseUri();

const resetProgress = async () => {
  try {
    // 1. Connect to the database
    await mongoose.connect(DB_URI);
    console.log("🔗 Database connection successful!");

    // 2. Safety check for production
    if (isProduction()) {
      console.log("🛑 PRODUCTION DETECTED - Extra safety checks enabled");

      const userCount = await User.countDocuments();
      if (userCount > 100) {
        // Arbitrary threshold
        console.error("❌ Too many users in production! Aborting.");
        console.error("💡 Use --force flag to override (not recommended)");

        // Check for force flag
        if (!process.argv.includes("--force")) {
          await mongoose.disconnect();
          process.exit(1);
        }
      }
    }

    // 3. Confirmation prompt
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const userCount = await User.countDocuments();
    console.log(
      `\n⚠️  WARNING: This will reset progress for ALL ${userCount} users!`,
    );
    console.log("   Data to be cleared:");
    console.log("   - Completed lessons/modules");
    console.log("   - XP, level, and streak");
    console.log("   - Badges and statistics");
    console.log("   - Progress history");

    const answer = await new Promise((resolve) => {
      rl.question("\nAre you sure you want to continue? (yes/no): ", resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== "yes") {
      console.log("❌ Reset cancelled.");
      await mongoose.disconnect();
      process.exit(0);
    }

    // 4. Backup option (optional but recommended)
    const backupAnswer = await new Promise((resolve) => {
      const rl2 = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl2.question("Create backup before reset? (yes/no): ", resolve);
      rl2.close();
    });

    if (backupAnswer.toLowerCase() === "yes") {
      console.log("💾 Creating backup...");
      // You could implement a simple backup here
      const users = await User.find({});
      const backup = {
        timestamp: new Date(),
        userCount: users.length,
        users: users.map((u) => ({
          email: u.email,
          completedLessons: u.completedLessons,
          completedModules: u.completedModules,
          xp: u.xp,
          level: u.level,
        })),
      };
      // Save backup to file
      const fs = require("fs");
      const backupDir = "./backups";
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }
      const backupFile = `${backupDir}/user_backup_${Date.now()}.json`;
      fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
      console.log(`✅ Backup saved to: ${backupFile}`);
    }

    // 5. Define the reset values
    const resetFields = {
      completedLessons: [],
      completedModules: [],
      lessonCompletionHistory: [],
      moduleCompletionHistory: [],
      xp: 0,
      level: 1,
      streak: 0,
      badges: [],
      stats: {
        lessonsCompleted: 0,
        modulesCompleted: 0,
        averageQuizScore: 0,
        totalTimeSpent: 0,
        lastActiveDate: null,
      },
      // Preserve authentication info
      // lastLoginDate: null // Optional: reset last login too
    };

    // 6. Run the update query
    console.log("\n🔄 Resetting user data...");

    // Optional: Keep test user or admin users
    const filter = {};
    if (process.argv.includes("--keep-admins")) {
      filter.role = { $ne: "admin" };
      console.log("👑 Preserving admin users...");
    }

    const result = await User.updateMany(filter, { $set: resetFields });

    console.log(`\n✅ Success!`);
    console.log(`📊 Matched ${result.matchedCount} users`);
    console.log(`📊 Modified ${result.modifiedCount} users`);

    if (result.matchedCount > result.modifiedCount) {
      console.log(
        `⚠️  ${result.matchedCount - result.modifiedCount} users were skipped (admins preserved)`,
      );
    }

    console.log("\n📋 Data cleared:");
    console.log("   - Completed lessons/modules");
    console.log("   - XP, level, and streak");
    console.log("   - Badges and statistics");
    console.log("   - Progress history");

    // 7. Verification
    const remainingProgress = await User.aggregate([
      {
        $match: {
          $or: [
            { completedLessons: { $exists: true, $ne: [] } },
            { completedModules: { $exists: true, $ne: [] } },
            { xp: { $gt: 0 } },
            { level: { $gt: 1 } },
          ],
        },
      },
      { $count: "count" },
    ]);

    if (remainingProgress[0]?.count > 0) {
      console.warn(
        `\n⚠️  Warning: ${remainingProgress[0].count} users still have progress data`,
      );
    } else {
      console.log("\n✅ All user progress successfully cleared!");
    }
  } catch (err) {
    console.error("❌ Error resetting user data:", err);
    process.exit(1);
  } finally {
    // 8. Disconnect
    await mongoose.disconnect();
    console.log("\n🔏 Database connection closed.");
  }
};

// Add command line argument support
if (require.main === module) {
  resetProgress();
}

module.exports = { resetProgress };
