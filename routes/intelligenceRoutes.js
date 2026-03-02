const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  getSummary,
  getProductivity,
  getRecommendations,
  runIntelligence
} = require("../controllers/intelligenceController");

// Run full intelligence
router.post("/run", protect, runIntelligence);

// Analytics endpoints
router.get("/summary", protect, getSummary);
router.get("/productivity", protect, getProductivity);
router.get("/recommendations", protect, getRecommendations);

module.exports = router;
