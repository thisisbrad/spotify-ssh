const mongoose = require("mongoose");

const requestLogSchema = new mongoose.Schema(
  {
    // Request Info
    method: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    statusCode: Number,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sessionId: String,
    ip: String,
    userAgent: String,
    responseTime: Number, // in milliseconds
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    queryParams: mongoose.Schema.Types.Mixed,
    body: mongoose.Schema.Types.Mixed,
    headers: mongoose.Schema.Types.Mixed,
    error: {
      message: String,
      stack: String,
    },
  },
  {
    // Auto-delete logs older than 30 days
    expires: 30 * 24 * 60 * 60,
  },
);

// Indexes for common queries
requestLogSchema.index({ userId: 1, timestamp: -1 });
requestLogSchema.index({ path: 1, timestamp: -1 });
requestLogSchema.index({ statusCode: 1, timestamp: -1 });

module.exports = mongoose.model("RequestLog", requestLogSchema);
