const express = require("express");
const router = express.Router();
const { login, logout, callback } = require("../controllers/authController");

router.get("login", login);
router.get("callback", callback);
router.get("logout", logout);

module.exports = router;
