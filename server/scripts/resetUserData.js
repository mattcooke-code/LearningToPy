// A one-off script to clear user progress
const mongoose = require("mongoose");
const User = require("../models/User"); // Adjust path to your User model
const { getDatabaseUri } = require("../config/envConfig");

const DB_URI = getDatabaseUri();

const resetProgress = async () => {
  try {
    // 1. Connect to the database
    await mongoose.connect(DB_URI);
    console.log("🔗 Database connection successful!");

    // Define the reset values
    const resetFields = {
      completedLessons: [],
      completedModules: [],
      lessonCompletionHistory: [],
      moduleCompletionHistory: [],
      xp: 0,
      level: 1,
      streak: 0,
      badges: [],
      stats: {}, // Reset the stats object entirely
      // NOTE: You might want to keep lastActiveDate/lastLoginDate for real users
      // For a full reset, you might set lastActiveDate: null
    };

    // 2. Run the update query (targeting all users or just the test user)
    // To target a specific user (e.g., your test account):
    // const filter = { email: 'your_test_email@example.com' };

    // To reset ALL users (BE CAREFUL!):
    const filter = {};

    const result = await User.updateMany(filter, { $set: resetFields });

    console.log(
      `✅ Success! Matched ${result.matchedCount} users and modified ${result.modifiedCount} users.`
    );
    console.log(
      "Data cleared: completed lessons/modules, history, XP, streak, badges, and stats are now 0/empty."
    );
  } catch (err) {
    console.error("❌ Error resetting user data:", err);
  } finally {
    // 3. Disconnect
    await mongoose.disconnect();
    console.log("🔏 Database connection closed.");
  }
};

// If you have a real User model file, you might need to adjust the export/import logic.
// If you run this script outside of your main app environment, ensure User model is defined/required.
// If not, you can define a simple schema and model here for this utility purpose.
// const UserSchema = new mongoose.Schema({ /* ... your fields ... */ });
// const User = mongoose.model('User', UserSchema);

resetProgress();
