/**
 * Script to fix module completion data
 * - Ensures M20 capstone is marked complete if all lessons are done
 * - Removes M0 from completedModules if present (tutorial shouldn't count)
 * - Recalculates user level based on actual completed modules
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { getDatabaseUri } = require("../config/envConfig");
const User = require("../models/User");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const { calculateLevelFromModules } = require("../utils/levelUtils");

async function fixModuleCompletion() {
  try {
    console.log("Connecting to database...");
    const MONGO_URI = getDatabaseUri();
    await mongoose.connect(MONGO_URI);
    console.log("Connected!");

    // Get all modules and build order map
    const modules = await Module.find({}).select("_id order title").lean();
    const moduleOrderMap = new Map(
      modules.map((m) => [m._id.toString(), m.order])
    );

    // Find M20 module
    const m20Module = modules.find((m) => m.order === 20);
    const m0Module = modules.find((m) => m.order === 0);

    if (!m20Module) {
      console.error("Module 20 not found!");
      process.exit(1);
    }

    console.log(`Found M20: ${m20Module._id}`);
    console.log(`Found M0: ${m0Module?._id}`);

    // Get all lessons for M20
    const m20Lessons = await Lesson.find({
      moduleId: m20Module._id,
      isPublished: true,
    }).select("_id");
    const m20LessonIds = m20Lessons.map((l) => l._id.toString());
    console.log(`M20 has ${m20LessonIds.length} lessons`);

    // Get all users
    const users = await User.find({}).select(
      "username completedModules completedLessons moduleCompletionHistory level xp"
    );

    let fixedCount = 0;
    let m0RemovedCount = 0;

    for (const user of users) {
      let needsSave = false;
      const userId = user._id.toString();
      const completedLessons = user.completedLessons || [];
      const completedModules = user.completedModules || [];

      console.log(`\n--- Checking user: ${user.username} ---`);
      console.log(
        `Current: ${completedModules.length} modules, Level ${user.level}`
      );

      // 1. Remove M0 from completedModules if present
      if (m0Module && completedModules.includes(m0Module._id.toString())) {
        console.log("  → Removing M0 from completedModules");
        user.completedModules = completedModules.filter(
          (id) => id !== m0Module._id.toString()
        );
        needsSave = true;
        m0RemovedCount++;
      }

      // 2. Check if M20 lessons are all complete but module is not marked
      const m20LessonsComplete = m20LessonIds.every((lessonId) =>
        completedLessons.includes(lessonId)
      );

      const m20Completed = user.completedModules.includes(
        m20Module._id.toString()
      );

      if (m20LessonsComplete && !m20Completed) {
        console.log(
          "  → All M20 lessons complete but module not marked! Adding..."
        );
        user.completedModules.push(m20Module._id.toString());

        // Add to module completion history
        if (!Array.isArray(user.moduleCompletionHistory)) {
          user.moduleCompletionHistory = [];
        }
        user.moduleCompletionHistory.push({
          moduleId: m20Module._id,
          completedAt: new Date(),
          quizScore: null,
          autoCompleted: true,
        });

        needsSave = true;
        fixedCount++;
      }

      // 3. Recalculate level
      const newLevel = calculateLevelFromModules(
        user.completedModules,
        moduleOrderMap
      );
      if (newLevel !== user.level) {
        console.log(`  → Level changed: ${user.level} → ${newLevel}`);
        user.level = newLevel;
        needsSave = true;
      }

      // 4. Check for other quiz-less modules that should be auto-completed
      for (const moduleData of modules) {
        if (moduleData.order === 0) continue; // Skip M0
        if (moduleData.order === 20) continue; // Already handled M20

        const moduleId = moduleData._id.toString();
        const isCompleted = user.completedModules.includes(moduleId);

        if (!isCompleted) {
          // Check if all lessons in this module are complete
          const moduleLessons = await Lesson.find({
            moduleId: moduleData._id,
            isPublished: true,
          }).select("_id");

          const moduleLessonIds = moduleLessons.map((l) => l._id.toString());
          const allLessonsComplete = moduleLessonIds.every((lessonId) =>
            completedLessons.includes(lessonId)
          );

          if (allLessonsComplete && moduleLessonIds.length > 0) {
            // Check if module has a quiz
            const fullModule = await Module.findById(moduleData._id).select(
              "moduleQuiz"
            );
            const hasQuiz =
              fullModule?.moduleQuiz?.questions?.length > 0 || false;

            if (!hasQuiz) {
              console.log(
                `  → Auto-completing M${moduleData.order} (quiz-less module)`
              );
              user.completedModules.push(moduleId);
              user.moduleCompletionHistory.push({
                moduleId: moduleData._id,
                completedAt: new Date(),
                quizScore: null,
                autoCompleted: true,
              });
              needsSave = true;
            }
          }
        }
      }

      if (needsSave) {
        await user.save();
        console.log("  ✓ Saved changes");
      } else {
        console.log("  ✓ No changes needed");
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Fixed M20 for ${fixedCount} users`);
    console.log(`Removed M0 from ${m0RemovedCount} users`);
    console.log("Done!");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixModuleCompletion();
