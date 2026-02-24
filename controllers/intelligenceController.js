const IntelligenceReport = require("../models/IntelligenceReport");
const { runIntelligencePipeline } = require("../intelligence/intelligenceEngine");

const runIntelligence = async (req, res) => {
  try {
    const { dailyData, weeklyData, last7Days, last30Days } = req.body;

    const intelligenceReport = runIntelligencePipeline({
      dailyData,
      weeklyData,
      last7Days,
      last30Days,
    });

    // 🔥 Save report to DB
    await IntelligenceReport.create({
      user: req.user._id,
      dailyScore: intelligenceReport.dailyScore,
      weeklyScore: intelligenceReport.weeklyScore,
      behaviorProfile: intelligenceReport.behaviorProfile,
      healthRisk: intelligenceReport.healthRisk,
      scheduleAdjustments: intelligenceReport.scheduleAdjustments,
    });

    res.status(200).json({
      success: true,
      intelligenceReport,
    });

  } catch (error) {
    console.error("INTELLIGENCE ERROR:", error);
    res.status(500).json({
      message: "Intelligence Engine Failed",
      error: error.message,
    });
  }
};

module.exports = {
  runIntelligence,
};
