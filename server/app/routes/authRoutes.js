const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  callback,
  getCurrentUser,
  getAttachedSessions,
} = require("../controllers/authController");
// localhost:3000/api/v1/auth
router.get("/login", login);
router.get("/callback", callback);
router.get("/current-user", getCurrentUser);
router.get("/current-sessions", getAttachedSessions);
router.post("/logout", logout);

module.exports = router;
