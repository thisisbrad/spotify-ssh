const express = require("express");
const router = express.Router();

router.get("albums");
router.get("artists");
router.get("tracks");

module.exports = router;
