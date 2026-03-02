const IntelligenceReport = require("../models/IntelligenceReport");
const IntelligenceHistory = require("../models/IntelligenceHistory");
const Task = require("../models/Task");

const { runIntelligencePipeline } = require("../intelligence/intelligenceEngine");
const calculateAdvancedAnalytics = require("../services/advancedAnalyticsService");
const adaptiveReschedule = require("../services/adaptiveSchedulerService");

/* =====================================================
   RUN FULL INTELLIGENCE PIPELINE
===================================================== */
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

    await IntelligenceReport.create({
      user: req.user._id,
      dailyScore: intelligenceReport.dailyScore,
      weeklyScore: intelligenceReport.weeklyScore,
      behaviorProfile: intelligenceReport.behaviorProfile,
      healthRisk: intelligenceReport.healthRisk,
      scheduleAdjustments: intelligenceReport.scheduleAdjustments,
    });

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

    const rescheduleResult = adaptiveReschedule(
      tasks || [],
      healthData?.energyLevel || "medium"
    );

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

/* =====================================================
   ANALYTICS: SUMMARY
===================================================== */
const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalTasks = await Task.countDocuments({ user: userId });

    const completed = await Task.countDocuments({
      user: userId,
      completed: true,
    });

    const pending = await Task.countDocuments({
      user: userId,
      completed: false,
    });

    const overdue = await Task.countDocuments({
      user: userId,
      completed: false,
      deadline: { $lt: new Date() },
    });

    res.json({
      totalTasks,
      completed,
      pending,
      overdue,
    });

  } catch (error) {
    console.error("SUMMARY ERROR:", error);
    res.status(500).json({ message: "Failed to fetch summary" });
  }
};

/* =====================================================
   ANALYTICS: PRODUCTIVITY
===================================================== */
const getProductivity = async (req, res) => {
  try {
    const userId = req.user._id;

    const total = await Task.countDocuments({ user: userId });

    const completed = await Task.countDocuments({
      user: userId,
      completed: true,
    });

    const score = total === 0 ? 0 : Math.round((completed / total) * 100);

    res.json({ score });

  } catch (error) {
    console.error("PRODUCTIVITY ERROR:", error);
    res.status(500).json({ message: "Failed to fetch productivity" });
  }
};

/* =====================================================
   ANALYTICS: RECOMMENDATIONS
===================================================== */
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    const pendingTasks = await Task.countDocuments({
      user: userId,
      completed: false,
    });

    let recommendations = [];

    if (pendingTasks > 5) {
      recommendations.push(
        "You have many pending tasks. Try prioritizing high-impact tasks."
      );
    }

    if (pendingTasks === 0) {
      recommendations.push(
        "Great job! You are fully on track."
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Maintain steady productivity to improve your performance."
      );
    }

    res.json({ recommendations });

  } catch (error) {
    console.error("RECOMMENDATION ERROR:", error);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
};

module.exports = {
  runIntelligence,
  getSummary,
  getProductivity,
  getRecommendations,
};
