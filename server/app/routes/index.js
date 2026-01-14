const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoutes");

// localhost:3000/api/v1/auth
router.use("/auth", authRoutes);

module.exports = router;
