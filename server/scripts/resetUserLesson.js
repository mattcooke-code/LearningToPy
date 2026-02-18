// server/scripts/resetUserLesson.js
const mongoose = require("mongoose");
const User = require("../models/User");
const Lesson = require("../models/Lesson");
const Module = require("../models/Module");
const { getDatabaseUri } = require("../config/envConfig");

const DB_URI = getDatabaseUri();

const resetUserLesson = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("🔗 Database connection successful!");

    // Parse command line arguments
    const args = process.argv.slice(2);
    const userId = args[0];
    const target = args[1]; // Can be "M9L1" or "M9"

    if (!userId || !target) {
      console.error(
        "❌ Usage: node resetUserLesson.js <userId> <lesson|module>",
      );
      console.error("   Examples:");
      console.error(
        "   node resetUserLesson.js 65abc123def M9L1  (reset single lesson)",
      );
      console.error(
        "   node resetUserLesson.js 65abc123def M9     (reset whole module)",
      );
      process.exit(1);
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      console.error(`❌ User not found with ID: ${userId}`);
      process.exit(1);
    }

    console.log(`\n👤 User: ${user.email || user._id}`);

    if (target.match(/^M\d+L\d+$/)) {
      // Reset single lesson (format: M9L1)
      const match = target.match(/^M(\d+)L(\d+)$/);
      const moduleNum = `M${match[1]}`;
      const lessonOrder = parseInt(match[2]);

      // Find the module
      const module = await Module.findOne({ moduleNumber: moduleNum });
      if (!module) {
        console.error(`❌ Module ${moduleNum} not found`);
        process.exit(1);
      }

      // Find the lesson
      const lesson = await Lesson.findOne({
        moduleId: module._id,
        order: lessonOrder,
      });

      if (!lesson) {
        console.error(`❌ Lesson ${target} not found`);
        process.exit(1);
      }

      console.log(`📘 Target: ${target} - ${lesson.title}`);

      // Remove from completedLessons
      const hadLesson = user.completedLessons.includes(lesson._id);
      if (hadLesson) {
        user.completedLessons = user.completedLessons.filter(
          (id) => id.toString() !== lesson._id.toString(),
        );

        // Update stats
        user.stats.lessonsCompleted = Math.max(
          0,
          user.stats.lessonsCompleted - 1,
        );

        // Reduce XP (assuming 10 XP per lesson - adjust as needed)
        user.xp = Math.max(0, user.xp - 10);

        // Recalculate level (simple formula - adjust as needed)
        user.level = Math.floor(user.xp / 100) + 1;

        await user.save();
        console.log(`✅ Reset ${target} for user`);
      } else {
        console.log(`ℹ️ User hasn't completed ${target}`);
      }
    } else if (target.match(/^M\d+$/)) {
      // Reset entire module (format: M9)
      const moduleNum = target;

      const module = await Module.findOne({ moduleNumber: moduleNum });
      if (!module) {
        console.error(`❌ Module ${moduleNum} not found`);
        process.exit(1);
      }

      // Find all lessons in this module
      const lessons = await Lesson.find({ moduleId: module._id });
      const lessonIds = lessons.map((l) => l._id.toString());

      console.log(`📚 Target: ${target} - ${module.title}`);
      console.log(`   Contains ${lessons.length} lessons`);

      // Count how many were completed
      const completedCount = user.completedLessons.filter((id) =>
        lessonIds.includes(id.toString()),
      ).length;

      if (completedCount > 0) {
        // Remove all module lessons from completedLessons
        user.completedLessons = user.completedLessons.filter(
          (id) => !lessonIds.includes(id.toString()),
        );

        // Update stats
        user.stats.lessonsCompleted = Math.max(
          0,
          user.stats.lessonsCompleted - completedCount,
        );

        // Reduce XP (10 XP per lesson)
        user.xp = Math.max(0, user.xp - completedCount * 10);

        // Recalculate level
        user.level = Math.floor(user.xp / 100) + 1;

        // If module was marked as completed, remove that too
        if (user.completedModules.includes(module._id)) {
          user.completedModules = user.completedModules.filter(
            (id) => id.toString() !== module._id.toString(),
          );
          user.stats.modulesCompleted = Math.max(
            0,
            user.stats.modulesCompleted - 1,
          );
        }

        await user.save();
        console.log(`✅ Reset ${completedCount} lessons from ${target}`);
      } else {
        console.log(`ℹ️ User hasn't completed any lessons in ${target}`);
      }
    } else {
      console.error(`❌ Invalid target format. Use M9L1 or M9`);
      process.exit(1);
    }

    console.log("\n📊 Updated user stats:");
    console.log(`   - Lessons completed: ${user.stats.lessonsCompleted}`);
    console.log(`   - Modules completed: ${user.stats.modulesCompleted}`);
    console.log(`   - XP: ${user.xp}`);
    console.log(`   - Level: ${user.level}`);
  } catch (err) {
    console.error("❌ Error resetting user progress:", err);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔏 Database connection closed.");
  }
};

if (require.main === module) {
  resetUserLesson();
}
