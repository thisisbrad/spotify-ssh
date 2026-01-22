const RequestLog = require("../models/RequestLog");
const SessionLog = require("../models/SessionLog");
const ErrorLog = require("../models/ErrorLog");
const UAParser = require("ua-parser-js");

// Parse user agent for device info
function parseUserAgent(userAgentString) {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();

  return {
    browser:
      `${result.browser.name || "Unknown"} ${result.browser.version || ""}`.trim(),
    os: `${result.os.name || "Unknown"} ${result.os.version || ""}`.trim(),
    device: result.device.type || "desktop",
  };
}

// Log HTTP requests
async function logRequest(req, res, responseTime, error = null) {
  try {
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      userId: req.session?.userId,
      sessionId: req.sessionID,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
      responseTime,
      queryParams: req.query,
      // Be careful not to log sensitive data like passwords
      body: sanitizeBody(req.body),
      timestamp: new Date(),
    };

    if (error) {
      logData.error = {
        message: error.message,
        stack: error.stack,
      };
    }

    await RequestLog.create(logData);
  } catch (err) {
    console.error("Failed to log request:", err);
  }
}

// Sanitize request body to remove sensitive data
function sanitizeBody(body) {
  if (!body) return null;

  const sanitized = { ...body };
  const sensitiveFields = ["password", "token", "secret", "apiKey"];

  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = "[REDACTED]";
    }
  });

  return sanitized;
}

// Log session events
async function logSession(event, req, metadata = {}) {
  try {
    const userAgent = req.get("user-agent");

    const logData = {
      sessionId: req.sessionID,
      userId: req.session?.userId || metadata.userId,
      event,
      ip: req.ip || req.connection.remoteAddress,
      userAgent,
      deviceInfo: parseUserAgent(userAgent),
      metadata,
      timestamp: new Date(),
    };

    await SessionLog.create(logData);
  } catch (err) {
    console.error("Failed to log session event:", err);
  }
}

// Log errors
async function logError(error, req = null, level = "error", context = {}) {
  try {
    const logData = {
      message: error.message,
      stack: error.stack,
      level,
      context,
      timestamp: new Date(),
    };

    if (req) {
      logData.method = req.method;
      logData.path = req.path;
      logData.userId = req.session?.userId;
      logData.ip = req.ip || req.connection.remoteAddress;
      logData.userAgent = req.get("user-agent");
    }

    await ErrorLog.create(logData);
  } catch (err) {
    console.error("Failed to log error:", err);
  }
}

module.exports = {
  logRequest,
  logSession,
  logError,
  parseUserAgent,
};
