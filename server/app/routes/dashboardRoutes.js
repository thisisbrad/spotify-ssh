const express = require("express");
const router = express.Router();
const { requireAuth, requireAuthWithRefresh } = require("../middleware/auth");

// localhost:3000/api/v1/dashboard
router.get("/", requireAuth, (req, res) => {
  res.json({
    message: "This is a protected route",
    userId: req.session.userId,
  });
});

// Example: User dashboard
router.get("/profile", requireAuthWithRefresh, (req, res) => {
  res.json({
    message: "Welcome to your dashboard",
    user: {
      name: req.user.name,
      email: req.user.email,
      picture: req.user.picture,
    },
  });
});

router.get("/data", requireAuthWithRefresh, (req, res) => {
  res.json({
    message: "This route auto-refreshes your session",
    user: req.user,
    sessionInfo: {
      id: req.sessionID,
      expiresAt: req.session.cookie._expires,
    },
  });
});

module.exports = router;
