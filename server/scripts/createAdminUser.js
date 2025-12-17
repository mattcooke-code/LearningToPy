#!/usr/bin/env node
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const readline = require("readline");
const { getDatabaseUri } = require("../config/envConfig");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const DB_URI = getDatabaseUri();

async function createAdminUser() {
  try {
    // Connect to database
    await mongoose.connect(DB_URI);
    console.log("🔗 Database connection successful!");

    rl.question("Enter user email to make admin: ", async (email) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
          console.log("❌ User not found");
          rl.close();
          process.exit(1);
        }

        if (user.isAdmin) {
          console.log("User is already an admin.");
        } else {
          user.isAdmin = true;
          await user.save();
          console.log(`✅ ${user.username} (${user.email}) is now an admin`);
        }

        rl.close();
        await mongoose.disconnect();
        process.exit(0);
      } catch (err) {
        console.error("Error:", err.message);
        rl.close();
        process.exit(1);
      }
    });
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
}

createAdminUser();
