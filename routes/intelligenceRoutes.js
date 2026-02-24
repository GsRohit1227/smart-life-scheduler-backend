const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { runIntelligencePipeline } = require("../intelligence/intelligenceEngine");

// @route   POST /api/intelligence/run
// @desc    Run full intelligence analysis
// @access  Private (JWT required)

router.post("/run", protect, async (req, res) => {
  try {
    const { dailyData, weeklyData, last7Days, last30Days } = req.body;

    const result = runIntelligencePipeline({
      dailyData,
      weeklyData,
      last7Days,
      last30Days,
    });

    res.status(200).json({
      success: true,
      user: req.user.id,
      intelligenceReport: result,
    });

  } catch (error) {
    console.error("Intelligence Error:", error.message);
    res.status(500).json({ message: "Intelligence Engine Failed" });
  }
});

module.exports = router;