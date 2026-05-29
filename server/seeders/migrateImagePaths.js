/**
 * migrateImagePaths.js
 *
 * One-time migration script to update image paths in lesson content.
 * Converts relative/absolute image paths to fully qualified Render URLs.
 *
 * Conversions performed:
 *   ./images/foo.PNG      → https://<BACKEND_URL>/curriculum/Module0_Tutorial/images/foo.png
 *   /curriculum/.../foo.PNG → https://<BACKEND_URL>/curriculum/.../foo.png
 *
 * Usage (run from project root):
 *   DRY_RUN=true node server/seeders/migrateImagePaths.js   ← preview changes, no writes
 *   node server/seeders/migrateImagePaths.js                ← apply changes
 *
 * Safe to re-run — already-migrated paths are skipped.
 */

if (process.env.NODE_ENV === "production") {
  require("dotenv").config({ path: ".env.production" });
} else {
  require("dotenv").config({ path: ".env.development" });
}

const mongoose = require("mongoose");
const { getDatabaseUri } = require("../config/envConfig");

// ─── Configuration ────────────────────────────────────────────────────────────

const BACKEND_URL =
  process.env.BACKEND_URL || "https://learningtopy.onrender.com";

const DRY_RUN = process.env.DRY_RUN === "true";

// Maps moduleNumber (e.g. "M0") to its curriculum folder name
const MODULE_FOLDER_MAP = {
  M0: "Module0_Tutorial",
  M1: "Module1_Fundamentals",
  M2: "Module2_DataStructures",
  M3: "Module3_ControlFlow",
  M4: "Module4_Iteration",
  M5: "Module5_DataStructures",
  M6: "Module6_Functions",
  M7: "Module7_File_IO",
  M8: "Module8_Error_Handling",
  M9: "Module9_Comprehensions",
  M10: "Module10_Advanced_Functions",
  M11: "Module11_OOP1",
  M12: "Module12_OOP2",
  M13: "Module13_Datetime",
  M14: "Module14_Regex",
  M15: "Module15_Tooling",
  M16: "Module16_API",
  M17: "Module17_DataScience",
  M18: "Module18_Scraping",
  M19: "Module19_Database",
  M20: "Module20_Project",
};

// ─── Path migration logic ─────────────────────────────────────────────────────

/**
 * Converts a single image src to a fully qualified URL.
 * Returns null if no change is needed.
 */
const migrateImageSrc = (src, moduleFolder) => {
  if (!src) return null;

  // Already a fully qualified URL — just fix .PNG → .png if needed
  if (src.startsWith("https://") || src.startsWith("http://")) {
    const fixed = src.replace(/\.PNG$/i, ".png");
    return fixed !== src ? fixed : null;
  }

  // Relative path: ./images/foo.PNG or ./images/foo.png
  if (src.startsWith("./images/")) {
    const filename = src.replace("./images/", "").replace(/\.PNG$/i, ".png");
    return `${BACKEND_URL}/curriculum/${moduleFolder}/images/${filename}`;
  }

  // Absolute path: /curriculum/Module0_Tutorial/images/foo.PNG
  if (src.startsWith("/curriculum/")) {
    const fixed = src.replace(/\.PNG$/i, ".png");
    return `${BACKEND_URL}${fixed}`;
  }

  return null;
};

/**
 * Rewrites all markdown image paths in a content string.
 * Matches: ![alt text](src) or ![alt text](src "title")
 */
const migrateContent = (content, moduleFolder) => {
  if (!content) return { content, changed: false, count: 0 };

  let changed = false;
  let count = 0;

  const updated = content.replace(
    /!\[([^\]]*)\]\(([^)\s"]+)([^)]*)\)/g,
    (match, alt, src, rest) => {
      const newSrc = migrateImageSrc(src, moduleFolder);
      if (newSrc) {
        changed = true;
        count++;
        return `![${alt}](${newSrc}${rest})`;
      }
      return match;
    },
  );

  return { content: updated, changed, count };
};

// ─── Main migration ───────────────────────────────────────────────────────────

const migrate = async () => {
  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(getDatabaseUri(), {
    maxPoolSize: 1,
    socketTimeoutMS: 30000,
    bufferCommands: false,
  });
  console.log("✅ Connected to MongoDB");

  if (DRY_RUN) {
    console.log("👁️  DRY RUN MODE — no changes will be written\n");
  }

  // Load models directly to avoid circular dependency issues
  const Lesson = require("../models/Lesson");
  const Module = require("../models/Module");

  const modules = await Module.find().sort({ order: 1 });
  console.log(`📦 Found ${modules.length} modules\n`);

  let totalLessons = 0;
  let totalUpdated = 0;
  let totalImageChanges = 0;

  for (const mod of modules) {
    const moduleFolder = MODULE_FOLDER_MAP[mod.moduleNumber];

    if (!moduleFolder) {
      console.warn(`⚠️  No folder mapping for ${mod.moduleNumber} — skipping`);
      continue;
    }

    const lessons = await Lesson.find({ moduleId: mod._id }).sort({ order: 1 });

    for (const lesson of lessons) {
      totalLessons++;

      const { content, changed, count } = migrateContent(
        lesson.content,
        moduleFolder,
      );

      if (!changed) continue;

      console.log(
        `  ✏️  ${mod.moduleNumber}L${lesson.order}: ${lesson.title} — ${count} image(s) updated`,
      );

      if (!DRY_RUN) {
        await Lesson.findByIdAndUpdate(lesson._id, { content });
      }

      totalUpdated++;
      totalImageChanges += count;
    }
  }

  console.log(`\n📊 Migration summary:`);
  console.log(`   Lessons scanned:  ${totalLessons}`);
  console.log(`   Lessons updated:  ${totalUpdated}`);
  console.log(`   Images migrated:  ${totalImageChanges}`);

  if (DRY_RUN) {
    console.log(`\n👁️  DRY RUN complete — run without DRY_RUN=true to apply`);
  } else {
    console.log(`\n✅ Migration complete`);
  }

  await mongoose.connection.close();
  console.log("🔌 MongoDB connection closed");
  process.exit(0);
};

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
