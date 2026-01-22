const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoutes");
const sessionRoutes = require("./sessionRoutes");

// localhost:3000/api/v1/auth
router.use("/auth", authRoutes);
router.use("/session", sessionRoutes);

module.exports = router;
