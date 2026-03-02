// server/seeders/updateCurriculum.js (REFACTORED VERSION)
const mongoose = require("mongoose");
const { getDatabaseUri, getSeedConfig } = require("../config/envConfig");
const { readContent, parseJSONContent } = require("./fileHelpers");
const { prepareQuizData, loadLessonAsset } = require("../utils/seederHelpers");
const {
  getModuleConfig,
  getLessonConfig,
  hasModuleConfig,
  validateModuleConfig,
  getAllModuleNumbers,
  getModuleSummary,
} = require("../config/moduleConfig");

/**
 * Selective curriculum updater - updates lessons/modules without nuking the DB
 *
 * Usage:
 *   node updateCurriculum.js --lesson M1L2        (update Module 1, Lesson 2)
 *   node updateCurriculum.js --module M3          (update all lessons in Module 3)
 *   node updateCurriculum.js --module M3 --with-quiz (update module + module quiz)
 *   node updateCurriculum.js --modules M1,M3,M5   (update multiple modules)
 *   node updateCurriculum.js --all-content        (update all lesson content only)
 *   node updateCurriculum.js --list               (show all configured modules)
 */

class CurriculumUpdater {
  constructor() {
    this.Module = require("../models/Module");
    this.Lesson = require("../models/Lesson");
  }

  async connect() {
    const MONGODB_URI = getDatabaseUri();
    console.log(`🔗 Connecting to MongoDB...`);
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 1,
      socketTimeoutMS: 30000,
      bufferCommands: false,
    });
    console.log("✅ Connected to MongoDB");
  }

  async disconnect() {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }

  /**
   * Update module quiz (review quiz)
   */
  async updateModuleQuiz(moduleNum, config, module) {
    try {
      const reviewQuizFile = `${moduleNum}_ReviewQuiz.json`;
      const reviewQuiz = parseJSONContent(config.folder, reviewQuizFile);

      if (!reviewQuiz) {
        console.log(`  ⚠️  No review quiz found for ${moduleNum}`);
        return false;
      }

      module.moduleQuiz = prepareQuizData(reviewQuiz, true);
      await module.save();
      console.log(`  ✅ Updated module quiz`);
      return true;
    } catch (error) {
      console.log(`  ⚠️  Could not update module quiz: ${error.message}`);
      return false;
    }
  }

  /**
   * Update a single lesson by its module and lesson number
   */
  async updateLesson(moduleNum, lessonNum) {
    try {
      console.log(`📝 Updating ${moduleNum} - Lesson ${lessonNum}...`);

      // Validate config exists
      if (!hasModuleConfig(moduleNum)) {
        throw new Error(
          `Module ${moduleNum} configuration not found. ` +
            `Available modules: ${getAllModuleNumbers().join(", ")}`,
        );
      }

      const config = getModuleConfig(moduleNum);
      const lessonConfig = getLessonConfig(moduleNum, lessonNum);

      if (!lessonConfig) {
        throw new Error(
          `Lesson ${lessonNum} not found in ${moduleNum}. ` +
            `Module has ${config.lessons.length} lessons.`,
        );
      }

      // Find the module
      const module = await this.Module.findOne({ moduleNumber: moduleNum });
      if (!module) {
        throw new Error(
          `Module ${moduleNum} not found in database. ` +
            `Run 'npm run seed' to create it first.`,
        );
      }

      // Prepare lesson data
      const lessonData = {
        title: lessonConfig.title,
        slug:
          lessonConfig.slug ||
          lessonConfig.title.toLowerCase().replace(/\s+/g, "-"),
        content: readContent(config.folder, lessonConfig.file),
        contentType: lessonConfig.type,
        quiz: loadLessonAsset(
          parseJSONContent,
          config.folder,
          lessonConfig.quiz,
          "quiz",
        ),
        exercise: loadLessonAsset(
          parseJSONContent,
          config.folder,
          lessonConfig.ex,
          "exercise",
        ),
        isPublished: true,
      };

      // Update or create lesson
      const result = await this.Lesson.findOneAndUpdate(
        {
          moduleId: module._id,
          order: lessonNum,
        },
        lessonData,
        {
          new: true,
          upsert: true,
          runValidators: true,
        },
      );

      console.log(`✅ Updated: ${result.title}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to update lesson:`, error.message);
      throw error;
    }
  }

  /**
   * Update all lessons in a module (preserves module metadata and prerequisites)
   */
  async updateModule(moduleNum, options = {}) {
    try {
      console.log(`📦 Updating Module ${moduleNum}...`);

      // Validate config
      const validation = validateModuleConfig(moduleNum);
      if (!validation.valid) {
        throw new Error(
          `Invalid module configuration:\n  - ${validation.issues.join("\n  - ")}`,
        );
      }

      const config = getModuleConfig(moduleNum);

      // Find existing module
      const module = await this.Module.findOne({ moduleNumber: moduleNum });
      if (!module) {
        if (options.createMissing) {
          console.log(`⚠️  Module ${moduleNum} not found, creating...`);
          // Create module with basic data (you'd need to import MODULE_HELPERS)
          const MODULE_HELPERS =
            require("../config/moduleConfig").MODULE_HELPERS;
          const metadata = MODULE_HELPERS.getModuleMetadata(moduleNum);

          // Create module
          const newModule = await this.Module.create({
            title: config.title,
            description: config.description,
            shortDescription: config.description.substring(0, 100) + "...",
            order: parseInt(moduleNum.slice(1)),
            moduleNumber: moduleNum,
            difficulty: metadata.difficulty,
            estimatedHours: metadata.estimatedHours,
            isPublished: true,
            learningObjectives: MODULE_HELPERS.getLearningObjectives(moduleNum),
            icon: metadata.icon,
            xpReward: metadata.xpReward,
          });

          // Use the created module
          module = newModule;
          console.log(`✅ Created new module: ${moduleNum}`);
        } else {
          throw new Error(
            `Module ${moduleNum} not found in database. ` +
              `Use --create-missing flag to create it.`,
          );
        }
      }

      console.log(`Found module: ${module.title}`);

      // Update module quiz if requested
      if (options.updateModuleQuiz) {
        await this.updateModuleQuiz(moduleNum, config, module);
      }

      // Update all lessons
      console.log(`Updating ${config.lessons.length} lessons...`);

      for (let i = 0; i < config.lessons.length; i++) {
        const l = config.lessons[i];
        const lessonData = {
          title: l.title,
          content: readContent(config.folder, l.file),
          order: i + 1,
          moduleId: module._id,
          contentType: l.type,
          quiz: loadLessonAsset(
            parseJSONContent,
            config.folder,
            l.quiz,
            "quiz",
          ),
          exercise: loadLessonAsset(
            parseJSONContent,
            config.folder,
            l.ex,
            "exercise",
          ),
          isPublished: true,
        };

        await this.Lesson.findOneAndUpdate(
          {
            moduleId: module._id,
            order: i + 1,
          },
          lessonData,
          {
            new: true,
            upsert: true,
            runValidators: true,
          },
        );

        console.log(`  ✓ Lesson ${i + 1}: ${l.title}`);
      }

      console.log(`✅ Module ${moduleNum} updated successfully`);
      return module;
    } catch (error) {
      console.error(`❌ Failed to update module:`, error.message);
      throw error;
    }
  }

  /**
   * Safely update multiple modules with progress reporting
   */
  async updateModulesBatch(moduleNums, options = {}) {
    try {
      console.log(`🔄 Batch updating ${moduleNums.length} modules...`);
      const results = [];

      for (let i = 0; i < moduleNums.length; i++) {
        const moduleNum = moduleNums[i].trim();
        console.log(
          `\n📦 [${i + 1}/${moduleNums.length}] Updating ${moduleNum}...`,
        );

        try {
          const result = await this.updateModule(moduleNum, options);
          results.push({ moduleNum, success: true, result });
          console.log(`✅ ${moduleNum} updated successfully`);
        } catch (error) {
          console.error(`❌ Failed to update ${moduleNum}:`, error.message);
          results.push({ moduleNum, success: false, error: error.message });

          // Continue with other modules unless --stop-on-error flag is set
          if (options.stopOnError) {
            throw error;
          }
        }
      }

      // Summary
      console.log("\n📊 Batch Update Summary:");
      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      console.log(`✅ Successful: ${successful}`);
      if (failed > 0) {
        console.log(`❌ Failed: ${failed}`);
        results
          .filter((r) => !r.success)
          .forEach((r) => {
            console.log(`   - ${r.moduleNum}: ${r.error}`);
          });
      }

      return results;
    } catch (error) {
      console.error("❌ Batch update failed:", error.message);
      throw error;
    }
  }

  /**
   * Check if database contains the module before updating
   */
  async validateDatabaseState(moduleNum) {
    const module = await this.Module.findOne({ moduleNumber: moduleNum });
    const lessonCount = await this.Lesson.countDocuments({
      moduleId: module?._id,
    });

    return {
      exists: !!module,
      lessonCount,
      moduleId: module?._id,
    };
  }

  /**
   * Update only content files (markdown/json) without changing database structure
   */
  async updateAllContent() {
    try {
      console.log(`📚 Updating all lesson content...`);

      const modules = await this.Module.find().sort({ order: 1 });
      let updatedCount = 0;
      let skippedCount = 0;

      for (const module of modules) {
        const config = getModuleConfig(module.moduleNumber);
        if (!config) {
          console.log(
            `⚠️  No config found for ${module.moduleNumber}, skipping`,
          );
          skippedCount++;
          continue;
        }

        const lessons = await this.Lesson.find({ moduleId: module._id }).sort({
          order: 1,
        });

        for (let i = 0; i < lessons.length; i++) {
          const lesson = lessons[i];
          const lessonConfig = config.lessons[i];

          if (!lessonConfig) {
            console.log(
              `⚠️  No config for lesson ${i + 1} in ${module.moduleNumber}`,
            );
            continue;
          }

          // Update only content, quiz, and exercise
          lesson.content = readContent(config.folder, lessonConfig.file);
          lesson.quiz = loadLessonAsset(
            parseJSONContent,
            config.folder,
            lessonConfig.quiz,
            "quiz",
          );
          lesson.exercise = loadLessonAsset(
            parseJSONContent,
            config.folder,
            lessonConfig.ex,
            "exercise",
          );

          await lesson.save();
          updatedCount++;
          console.log(
            `  ✓ ${module.moduleNumber}L${lesson.order}: ${lesson.title}`,
          );
        }

        // Optionally update module quiz
        try {
          const reviewQuizFile = `${module.moduleNumber}_ReviewQuiz.json`;
          const reviewQuiz = parseJSONContent(config.folder, reviewQuizFile);
          if (reviewQuiz) {
            module.moduleQuiz = prepareQuizData(reviewQuiz, true);
            await module.save();
            console.log(`  ✓ ${module.moduleNumber} review quiz updated`);
          }
        } catch (error) {
          // Silently ignore missing quiz files
        }
      }

      console.log(`\n✅ Updated ${updatedCount} lessons`);
      if (skippedCount > 0) {
        console.log(`⚠️  Skipped ${skippedCount} modules (no config)`);
      }
      return { updatedCount, skippedCount };
    } catch (error) {
      console.error(`❌ Failed to update content:`, error.message);
      throw error;
    }
  }

  /**
   * List all configured modules
   */
  listModules() {
    console.log("📚 Configured Modules:\n");
    const summary = getModuleSummary();

    summary.forEach(({ moduleNum, title, lessonCount, folder }) => {
      console.log(`  ${moduleNum}: ${title}`);
      console.log(`      Lessons: ${lessonCount}`);
      console.log(`      Folder: ${folder}\n`);
    });

    console.log(`Total: ${summary.length} modules configured`);
  }

  /**
   * Verify lesson integrity after updates
   */
  async verify() {
    console.log(`🔍 Verifying curriculum integrity...`);

    const modules = await this.Module.find().sort({ order: 1 });
    const issues = [];

    for (const module of modules) {
      const lessons = await this.Lesson.find({ moduleId: module._id }).sort({
        order: 1,
      });

      // Check for order gaps
      for (let i = 0; i < lessons.length; i++) {
        if (lessons[i].order !== i + 1) {
          issues.push(
            `${module.moduleNumber}: Lesson order gap at position ${i + 1}`,
          );
        }
      }

      // Check for missing content
      for (const lesson of lessons) {
        if (!lesson.content || lesson.content.trim() === "") {
          issues.push(`${module.moduleNumber}L${lesson.order}: Empty content`);
        }
      }

      // Verify config exists
      if (!hasModuleConfig(module.moduleNumber)) {
        issues.push(
          `${module.moduleNumber}: No configuration found in moduleConfig.js`,
        );
      }
    }

    if (issues.length > 0) {
      console.log(`⚠️  Found ${issues.length} issues:`);
      issues.forEach((issue) => console.log(`  - ${issue}`));
    } else {
      console.log(`✅ No issues found`);
    }

    return issues;
  }
}

// CLI handler
async function main() {
  const args = process.argv.slice(2);
  const updater = new CurriculumUpdater();

  try {
    // Handle --list without connecting to database
    if (args.includes("--list")) {
      updater.listModules();
      process.exit(0);
    }

    await updater.connect();

    // Parse arguments
    if (args.includes("--lesson")) {
      const lessonCode = args[args.indexOf("--lesson") + 1];
      const match = lessonCode.match(/^M(\d+)L(\d+)$/);
      if (!match) {
        throw new Error(
          "Invalid lesson format. Use: M1L2 (Module 1, Lesson 2)",
        );
      }
      const moduleNum = `M${match[1]}`;
      const lessonNum = parseInt(match[2]);

      // Add validation check
      const dbState = await updater.validateDatabaseState(moduleNum);
      if (!dbState.exists) {
        console.warn(`⚠️ Module ${moduleNum} not found in database`);
        const shouldCreate =
          process.env.NODE_ENV !== "production" &&
          args.includes("--create-missing");
        if (shouldCreate) {
          // Note: This would need MODULE_HELPERS imported
          console.error("--create-missing not fully implemented for lessons");
          process.exit(1);
        } else {
          throw new Error(
            `Module ${moduleNum} doesn't exist. ` +
              `Use 'npm run seed' to create it first.`,
          );
        }
      }

      await updater.updateLesson(moduleNum, lessonNum);
    } else if (args.includes("--module")) {
      const moduleNum = args[args.indexOf("--module") + 1];
      const updateQuiz = args.includes("--with-quiz");
      const createMissing = args.includes("--create-missing");

      await updater.updateModule(moduleNum, {
        updateModuleQuiz: updateQuiz,
        createMissing,
      });
    } else if (args.includes("--modules")) {
      const moduleList = args[args.indexOf("--modules") + 1].split(",");
      const updateQuiz = args.includes("--with-quiz");
      const stopOnError = args.includes("--stop-on-error");
      const createMissing = args.includes("--create-missing");

      await updater.updateModulesBatch(moduleList, {
        updateModuleQuiz: updateQuiz,
        stopOnError,
        createMissing,
      });
    } else if (args.includes("--all-content")) {
      console.log(
        "⚠️  This will update ALL lesson content across ALL modules.",
      );
      console.log("💡 Consider using --modules to update specific modules.");

      // Add confirmation in production
      if (process.env.NODE_ENV === "production") {
        const readline = require("readline");
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        const answer = await new Promise((resolve) => {
          rl.question(
            "Are you sure you want to update ALL content in production? (yes/no): ",
            resolve,
          );
        });
        rl.close();

        if (answer.toLowerCase() !== "yes") {
          console.log("Update cancelled.");
          await updater.disconnect();
          process.exit(0);
        }
      }

      await updater.updateAllContent();
    } else if (args.includes("--verify")) {
      const issues = await updater.verify();
      if (issues.length > 0) {
        process.exit(1); // Exit with error code if issues found
      }
    } else {
      console.log(`
📚 Curriculum Updater - Selective Seeding Tool

Usage:
  npm run update:lesson M1L2                      Update single lesson
  npm run update:module M3                        Update all lessons in module
  npm run update:module M3 -- --with-quiz         Update module + module quiz
  npm run update:modules M1,M3,M5                 Update multiple modules
  npm run update:all-content                      Update all content files
  npm run update:verify                            Check curriculum integrity
  npm run update:list                              Show configured modules

Advanced:
  --create-missing                                 Create missing modules (dev only)
  --stop-on-error                                   Stop batch on first error

Examples:
  node server/seeders/updateCurriculum.js --lesson M2L3
  node server/seeders/updateCurriculum.js --module M5 --with-quiz
  node server/seeders/updateCurriculum.js --modules M1,M2,M3 --stop-on-error

Note: 
  - Updates preserve module prerequisites and structure
  - Use 'npm run seed' for full reseeds or new modules
  - This tool only works with existing modules in the database
  - Module configurations are in: server/config/moduleConfig.js
      `);
    }

    await updater.verify();
    await updater.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Update failed:", error);
    if (updater.disconnect) {
      await updater.disconnect();
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = CurriculumUpdater;
