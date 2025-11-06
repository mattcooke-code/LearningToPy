// server.js
if (process.env.NODE_ENV === "production") {
  require("dotenv").config({ path: ".env.production" });
} else {
  require("dotenv").config({ path: ".env.development" });
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
// --- IMPORT ERROR HANDLING ---
const AppError = require("./utils/AppError");
const { sendJsonResponse } = require("./utils/responseHelpers");
const errorHandler = require("./middleware/errorHandler");

// --- IMPORT ROUTES ---
const authRoutes = require("./routes/auth");

const app = express();

// --- MIDDLEWARE ---
app.use(express.json({ limit: "10mb" }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// --- DATABASE ---
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/learning-to-py"
    );
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("⚠️  Continuing without database connection...");
  }
};

connectDB();

// --- ROUTES ---
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (req, res) => {
  sendJsonResponse(res, 200, "Server is running!");
});

// Favicon requests
app.get("/favicon.ico", (req, res) => res.status(204).end());

// --- UNHANDLED ROUTES (404) ---
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// --- GLOBAL ERROR HANDLER ---
app.use(errorHandler);

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
});
