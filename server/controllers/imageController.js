// server/controllers/imageController.js
const path = require("path");
const fs = require("fs").promises;
const catchAsync = require("../utils/catchAsync");

/**
 * Mapping of module IDs to curriculum folder names.
 * Used to locate badge/icon images on the filesystem.
 */
const moduleFolders = {
  M0: "Module0_Tutorial",
  M1: "Module1_Fundamentals",
  M2: "Module2_DataStructures",
  M3: "Module3_ControlFlow",
  M4: "Module4_Iteration",
  M5: "Module5_DataStructures",
  M12: "Module12_OOP2",
  M15: "Module15_Tooling",
  M16: "Module16_API",
};

/**
 * File extension → MIME type mapping for image serving.
 */
const mimeTypes = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

/**
 * Serve module badge/icon images from the filesystem.
 *
 * Looks up images by module order number (e.g., /api/images/module/5.png).
 * Images are served from the badges directory with proper content-type headers.
 *
 * @route   GET /api/images/module/:imageName
 * @param   {string} imageName - Image filename (e.g., "5.png")
 * @returns {Buffer} 200 - Image file with correct Content-Type
 * @returns {Object} 404 - Image not found
 */
const serveModuleImage = catchAsync(async (req, res) => {
  const { moduleId, imageName } = req.params;

  // Security check
  if (imageName.includes("..") || imageName.includes("/")) {
    return res.status(400).json({ error: "Invalid image name" });
  }

  const folder = moduleFolders[moduleId];
  if (!folder) {
    return res.status(404).json({ error: "Module not found" });
  }

  // Try multiple possible base paths
  const possiblePaths = [
    path.join(__dirname, "..", "curriculum", folder, "images", imageName),
    path.join(process.cwd(), "curriculum", folder, "images", imageName),
    path.join(
      process.cwd(),
      "server",
      "curriculum",
      folder,
      "images",
      imageName,
    ),
    path.join(
      "/opt/render/project/src",
      "curriculum",
      folder,
      "images",
      imageName,
    ),
    path.join(
      "/opt/render/project/src",
      "server",
      "curriculum",
      folder,
      "images",
      imageName,
    ),
  ];

  let imagePath = null;

  for (const testPath of possiblePaths) {
    try {
      await fs.access(testPath);
      imagePath = testPath;
      console.log(`DEBUG: FOUND at: ${testPath}`);
      break;
    } catch (error) {
      // Continue to next path
    }
  }

  if (!imagePath) {
    return res.status(404).json({
      error: "Image not found",
      debug:
        process.env.NODE_ENV === "development" ? { possiblePaths } : undefined,
    });
  }

  // Set Content-Type based on extension
  const ext = path.extname(imageName).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";

  // Set caching headers
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.setHeader("Content-Type", contentType);

  res.sendFile(imagePath);
});

module.exports = {
  serveModuleImage,
};
