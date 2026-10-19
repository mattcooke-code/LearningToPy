// cronAuth.js
const { getCronSecret } = require("../config/envConfig");

const cronAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      message: "Missing or invalid authorization header",
    });
  }

  const token = authHeader.replace("Bearer ", "");

  if (token !== getCronSecret()) {
    return res.status(401).json({
      status: "error",
      message: "Invalid cron secret",
    });
  }
  next();
};

module.exports = cronAuth;
