const mongoose = require("mongoose");

const intelligenceReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dailyScore: {
      dailyScore: Number,
      completionRate: Number,
    },
    weeklyScore: {
      weeklyScore: Number,
      completionRate: Number,
      burnoutRisk: String,
      disciplineLevel: String,
    },
    behaviorProfile: {
      consistencyTrend: String,
      sleepPattern: String,
      workloadStatus: String,
    },
    healthRisk: {
      riskLevel: String,
      recommendationIntensity: String,
      action: String,
    },
    scheduleAdjustments: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "IntelligenceReport",
  intelligenceReportSchema
);
