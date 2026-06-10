// server/controllers/imageController.js
const path = require("path");
const fsSync = require("fs");
const fs = require("fs/promises");
const catchAsync = require("../utils/catchAsync");

// ── Resolve base image path once at startup ──────────────────────

const resolveBasePath = () => {
  const candidates = [
    path.join(__dirname, "..", "curriculum"),
    path.join(process.cwd(), "curriculum"),
    path.join(process.cwd(), "server", "curriculum"),
    path.join("/opt/render/project/src", "curriculum"),
    path.join("/opt/render/project/src", "server", "curriculum"),
  ];

  for (const candidate of candidates) {
    if (fsSync.existsSync(candidate)) {
      return candidate;
    }
  }

  return candidates[0]; // Fallback — will 404 if incorrect
};

const BASE_IMAGE_PATH = resolveBasePath();

// ── Module folder mapping ────────────────────────────────────────

/**
 * Maps module IDs (M0, M1, ...) to curriculum folder names.
 * If a module is not listed here, the controller will fall back to
 * scanning the curriculum directory for a matching folder.
 */
const moduleFolders = {
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

// ── MIME types ────────────────────────────────────────────────────

const mimeTypes = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

// ── Controller ────────────────────────────────────────────────────

/**
 * Serve module badge/icon images from the filesystem.
 *
 * Base path is resolved once at startup (O(1) per request instead of
 * O(n) sequential fs.access calls). Images are cached for 24 hours.
 *
 * @route   GET /api/images/module/:moduleId/:imageName
 * @param   {string} moduleId  - Module ID (e.g., "M5")
 * @param   {string} imageName - Image filename (e.g., "5.png")
 * @returns {Buffer} 200 - Image file with correct Content-Type
 * @returns {Object} 400 - Invalid image name (path traversal attempt)
 * @returns {Object} 404 - Image or module not found
 */
const serveModuleImage = catchAsync(async (req, res) => {
  const { moduleId, imageName } = req.params;

  // Security: prevent path traversal
  if (
    imageName.includes("..") ||
    imageName.includes("/") ||
    imageName.includes("\\")
  ) {
    return res.status(400).json({ error: "Invalid image name" });
  }

  const folder = moduleFolders[moduleId];
  if (!folder) {
    return res.status(404).json({ error: "Module not found" });
  }

  const imagePath = path.join(BASE_IMAGE_PATH, folder, "images", imageName);

  try {
    await fs.access(imagePath);
  } catch {
    return res.status(404).json({
      error: "Image not found",
      debug: process.env.NODE_ENV === "development" ? { imagePath } : undefined,
    });
  }

  const ext = path.extname(imageName).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";

  res.setHeader("Cache-Control", "public, max-age=86400");
  res.setHeader("Content-Type", contentType);

  res.sendFile(imagePath, (err) => {
    if (err) {
      // File removed between access check and send
      if (!res.headersSent) {
        res.status(404).json({ error: "Image not found" });
      }
    }
  });
});

module.exports = {
  serveModuleImage,
};
