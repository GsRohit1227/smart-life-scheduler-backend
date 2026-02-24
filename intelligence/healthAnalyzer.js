// intelligence/healthAnalyzer.js

const analyzeHealthRisk = ({
  weeklyScore,
  behaviorProfile,
}) => {
  let riskLevel = "LOW";
  let recommendationIntensity = "NORMAL";
  let action = "Maintain current schedule";

  // 🔹 High Risk Conditions
  if (
    weeklyScore.burnoutRisk === "HIGH" ||
    behaviorProfile.sleepPattern === "CRITICAL" ||
    behaviorProfile.consistencyTrend === "DECLINING"
  ) {
    riskLevel = "HIGH";
    recommendationIntensity = "URGENT";
    action = "Reduce workload and prioritize recovery";
  }

  // 🔹 Medium Risk Conditions
  else if (
    weeklyScore.burnoutRisk === "MEDIUM" ||
    behaviorProfile.sleepPattern === "IRREGULAR"
  ) {
    riskLevel = "MEDIUM";
    recommendationIntensity = "MODERATE";
    action = "Adjust workload slightly and improve sleep";
  }

  return {
    riskLevel,
    recommendationIntensity,
    action,
  };
};

module.exports = {
  analyzeHealthRisk,
};