
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
    console.error("Intelligence Error:", error.message);
    res.status(500).json({ message: "Intelligence Engine Failed" });
  }
};

module.exports = {
  runIntelligence,
};