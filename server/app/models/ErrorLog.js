const mongoose = require("mongoose");

const errorLogSchema = new mongoose.Schema(
  {
    // Error Details
    message: {
      type: String,
      required: true,
    },
    stack: String,
    level: {
      type: String,
      enum: ["error", "warning", "critical"],
      default: "error",
    },
    method: String,
    path: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ip: String,
    userAgent: String,
    context: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // Resolution tracking
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: Date,
    resolvedBy: String,
  },
  {
    expires: 90 * 24 * 60 * 60, // Keep for 90 days
  },
);

errorLogSchema.index({ level: 1, timestamp: -1 });
errorLogSchema.index({ resolved: 1, timestamp: -1 });

module.exports = mongoose.model("ErrorLog", errorLogSchema);
