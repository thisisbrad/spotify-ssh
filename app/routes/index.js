const express = require("express");
const router = express.Router();
const authRoutes = require("../routes/authRoutes");

// localhost:5050/api/v1/auth
router.use("/auth", authRoutes);

module.exports = router;
