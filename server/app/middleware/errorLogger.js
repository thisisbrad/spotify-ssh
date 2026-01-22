const { logError } = require("../utils/logger");

function errorLogger(err, req, res, next) {
  // Determine error level
  let level = "error";
  if (err.status >= 500) {
    level = "critical";
  } else if (err.status >= 400 && err.status < 500) {
    level = "warning";
  }

  // Log the error
  logError(err, req, level, {
    body: req.body,
    params: req.params,
    query: req.query,
  }).catch((logErr) => {
    console.error("Error logging failed:", logErr);
  });

  // Pass to next error handler
  next(err);
}

module.exports = errorLogger;
