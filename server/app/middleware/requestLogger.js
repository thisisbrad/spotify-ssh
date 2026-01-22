const { logRequest } = require("../utils/logger");

function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Capture the original end function
  const originalEnd = res.end;

  // Override res.end to log after response is sent
  res.end = function (...args) {
    const responseTime = Date.now() - startTime;

    // Log the request asynchronously (don't wait for it)
    logRequest(req, res, responseTime).catch((err) => {
      console.error("Request logging failed:", err);
    });

    // Call the original end function
    originalEnd.apply(res, args);
  };

  next();
}

module.exports = requestLogger;
