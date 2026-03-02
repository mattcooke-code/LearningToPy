// server/controllers/imageController.js
const path = require("path");
const fs = require("fs").promises;
const catchAsync = require("../utils/catchAsync");

// Map module IDs to folder names
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

const mimeTypes = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

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

  const imagePath = path.join(
    __dirname,
    "..",
    "curriculum",
    folder,
    "images",
    imageName,
  );

  // Check if file exists
  try {
    await fs.access(imagePath);
  } catch (error) {
    return res.status(404).json({ error: "Image not found" });
  }

  // Set Content-Type based on extension
  const ext = path.extname(imageName).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";

  // Set caching headers (1 day)
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.setHeader("Content-Type", contentType);

  res.sendFile(imagePath);
});

module.exports = {
  serveModuleImage,
};
