const mongoose = require("mongoose");

const sessionLogSchema = new mongoose.Schema(
  {
    // Session Info
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Event Type
    event: {
      type: String,
      required: true,
      enum: [
        "login",
        "logout",
        "session_created",
        "session_refreshed",
        "session_expired",
        "logout_all_devices",
        "failed_login",
        "suspicious_activity",
      ],
    },
    ip: String,
    userAgent: String,
    deviceInfo: {
      browser: String,
      os: String,
      device: String,
    },
    // Additional Context
    metadata: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    expires: 90 * 24 * 60 * 60, // Keep for 90 days
  },
);

// Compound indexes for common queries
sessionLogSchema.index({ userId: 1, timestamp: -1 });
sessionLogSchema.index({ event: 1, timestamp: -1 });
sessionLogSchema.index({ sessionId: 1, timestamp: -1 });

module.exports = mongoose.model("SessionLog", sessionLogSchema);
