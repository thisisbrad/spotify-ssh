const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  callback,
  getCurrentUser,
} = require("../controllers/authController");
const { requireAuthWithRefresh } = require("../middleware/auth");
// localhost:3000/api/v1/auth
router.get("/login", login);
router.get("/callback", callback);
router.get("/current-user", requireAuthWithRefresh, getCurrentUser);
router.post("/logout", logout);

module.exports = router;
