const IntelligenceReport = require("../models/IntelligenceReport");
const { runIntelligencePipeline } = require("../intelligence/intelligenceEngine");

const calculateAdvancedAnalytics = require("../services/advancedAnalyticsService");
const IntelligenceHistory = require("../models/IntelligenceHistory");
const adaptiveReschedule = require("../services/adaptiveSchedulerService");

const runIntelligence = async (req, res) => {
  try {
    const {
      dailyData,
      weeklyData,
      last7Days,
      last30Days,
      tasks,
      healthData,
    } = req.body;

    const intelligenceReport = runIntelligencePipeline({
      dailyData,
      weeklyData,
      last7Days,
      last30Days,
    });

    // 🔥 Save original intelligence report
    await IntelligenceReport.create({
      user: req.user._id,
      dailyScore: intelligenceReport.dailyScore,
      weeklyScore: intelligenceReport.weeklyScore,
      behaviorProfile: intelligenceReport.behaviorProfile,
      healthRisk: intelligenceReport.healthRisk,
      scheduleAdjustments: intelligenceReport.scheduleAdjustments,
    });

    // ✅ Safe analytics calculation
    const analytics = calculateAdvancedAnalytics(
      tasks || [],
      healthData || {}
    );

    const savedReport = await IntelligenceHistory.create({
      user: req.user._id,
      type: "weekly",
      productivityScore: analytics.productivityScore,
      healthScore: analytics.healthScore,
      insights: analytics.insights,
      suggestions: analytics.suggestions,
      rawDataSnapshot: {
        tasks: tasks || [],
        healthData: healthData || {},
      },
    });

    // 🎯 STEP 2 — Adaptive Scheduling Integration
    const rescheduleResult = adaptiveReschedule(
      tasks || [],
      healthData?.energyLevel || "medium"
    );

    // ✅ Return everything
    res.json({
      baseIntelligence: intelligenceReport,
      advancedAnalytics: savedReport,
      adaptiveScheduling: rescheduleResult,
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
