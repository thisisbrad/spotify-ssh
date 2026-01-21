const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  callback,
  getCurrentUser,
} = require("../controllers/authController");
// localhost:3000/api/v1/auth
router.get("/login", login);
router.get("/callback", callback);
router.get("/current-user", getCurrentUser);
router.post("/logout", logout);
router.get("/session-test", (req, res) => {
  res.json({
    sessionId: req.sessionID,
    sessionData: req.session,
    hasUserId: !!req.session.userId,
  });
});

module.exports = router;
