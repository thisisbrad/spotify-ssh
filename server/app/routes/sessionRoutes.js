const express = require("express");
const router = express.Router();
const {
  checkSessionStatus,
  refreshSession,
} = require("../controllers/sessionController");
const { requireAuth } = require("../middleware/auth");
// localhost:3000/api/v1/session
router.get("/status", checkSessionStatus);
router.post("/refresh", requireAuth, refreshSession);

module.exports = router;
