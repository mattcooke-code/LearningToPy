// server.js
if (process.env.NODE_ENV === "production") {
  require("dotenv").config({ path: ".env.production" });
} else {
  require("dotenv").config({ path: ".env.development" });
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const config = require("./config/envConfig");

// Error handling
const AppError = require("./utils/AppError");
const { sendJsonResponse } = require("./utils/responseHelpers");
const errorHandler = require("./middleware/errorHandler");

// Routes
const adminRoutes = require("./routes/admin");
const analyticsRoutes = require("./routes/analytics");
const authRoutes = require("./routes/auth");
const progressRoutes = require("./routes/progress");
const contentRoutes = require("./routes/content");

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Database
const connectDB = async () => {
  try {
    await mongoose.connect(config.getDatabaseUri());
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("⚠️  Continuing without database connection...");
  }
};

connectDB();

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/content", contentRoutes);

// Health check
app.get("/api/health", (req, res) => {
  sendJsonResponse(res, 200, "OK", {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// Favicon
app.get("/favicon.ico", (req, res) => res.status(204).end());

// 404 handler
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler (MUST be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${config.getNodeEnv()}`);
});

// Handle process-level errors
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});
