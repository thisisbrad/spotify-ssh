const express = require("express");
const RequestLog = require("../models/RequestLog");
const SessionLog = require("../models/SessionLog");
const ErrorLog = require("../models/ErrorLog");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();

// Get user's session history
router.get("/my-sessions", requireAuth, async (req, res) => {
  try {
    const logs = await SessionLog.find({ userId: req.session.userId })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's request history
router.get("/my-requests", requireAuth, async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const logs = await RequestLog.find({ userId: req.session.userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await RequestLog.countDocuments({
      userId: req.session.userId,
    });

    res.json({
      logs,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get login history with device info
router.get("/login-history", requireAuth, async (req, res) => {
  try {
    const logins = await SessionLog.find({
      userId: req.session.userId,
      event: { $in: ["login", "session_created"] },
    })
      .sort({ timestamp: -1 })
      .limit(20);

    const formatted = logins.map((log) => ({
      timestamp: log.timestamp,
      ip: log.ip,
      device: log.deviceInfo,
      location: log.location,
      event: log.event,
    }));

    res.json({ logins: formatted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all errors (you might want additional auth check here)
router.get("/errors", requireAuth, async (req, res) => {
  try {
    const { resolved, level, limit = 50 } = req.query;

    const filter = {};
    if (resolved !== undefined) {
      filter.resolved = resolved === "true";
    }
    if (level) {
      filter.level = level;
    }

    const errors = await ErrorLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({ errors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics: Get request statistics
router.get("/analytics/requests", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const filter = { userId };
    if (Object.keys(dateFilter).length > 0) {
      filter.timestamp = dateFilter;
    }

    const stats = await RequestLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          avgResponseTime: { $avg: "$responseTime" },
          errors: {
            $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] },
          },
        },
      },
    ]);

    const byMethod = await RequestLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$method",
          count: { $sum: 1 },
        },
      },
    ]);

    const byPath = await RequestLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$path",
          count: { $sum: 1 },
          avgResponseTime: { $avg: "$responseTime" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      overall: stats[0] || { totalRequests: 0, avgResponseTime: 0, errors: 0 },
      byMethod,
      topPaths: byPath,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
