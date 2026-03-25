// /server/scripts/fixUserLevels.js
const mongoose = require("mongoose");
const User = require("../models/User");
const Module = require("../models/Module");
const { getDatabaseUri } = require("../config/envConfig");
require("dotenv").config({ path: "../.env.development" });

const fixUserLevels = async () => {
  const DB_URI = getDatabaseUri();
  try {
    await mongoose.connect(DB_URI);
    console.log("Connected to MongoDB");

    const allModules = await Module.find({}).select("order").lean();
    const moduleOrderMap = new Map(
      allModules.map((m) => [m._id.toString(), m.order]),
    );

    const users = await User.find({});

    for (const user of users) {
      let calculatedLevel = 1;

      if (user.completedModules && Array.isArray(user.completedModules)) {
        const completedRegularModules = user.completedModules.filter(
          (moduleId) => {
            const order = moduleOrderMap.get(moduleId.toString());
            return order !== undefined && order > 0;
          },
        );
        calculatedLevel = Math.min(
          20,
          Math.max(1, completedRegularModules.length),
        );
      }

      if (user.level !== calculatedLevel) {
        user.level = calculatedLevel;
        await user.save();
        console.log(
          `Updated ${user.username}: level ${user.level} -> ${calculatedLevel}`,
        );
      }
    }

    console.log("User level fix completed");
    process.exit(0);
  } catch (error) {
    console.error("Error fixing user levels:", error);
    process.exit(1);
  }
};

fixUserLevels();
