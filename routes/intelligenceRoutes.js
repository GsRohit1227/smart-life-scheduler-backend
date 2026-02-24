const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { runIntelligence } = require("../controllers/intelligenceController");

router.post("/run", protect, runIntelligence);

module.exports = router;