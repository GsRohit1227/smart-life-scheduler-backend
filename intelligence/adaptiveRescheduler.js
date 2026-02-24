// intelligence/adaptiveRescheduler.js

const generateScheduleAdjustment = ({
  healthRisk,
  behaviorProfile,
}) => {
  let adjustments = [];

  // 🔴 High Risk
  if (healthRisk.riskLevel === "HIGH") {
    adjustments.push("Reduce daily task load by 30%");
    adjustments.push("Add mandatory 1-hour recovery block");
    adjustments.push("Avoid late-night tasks");
  }

  // 🟡 Medium Risk
  else if (healthRisk.riskLevel === "MEDIUM") {
    adjustments.push("Reduce daily task load by 10%");
    adjustments.push("Improve sleep consistency");
  }

  // 🟢 Low Risk
  else {
    adjustments.push("Maintain current structure");
  }

  // 📈 Underutilized Boost
  if (behaviorProfile.workloadStatus === "UNDERUTILIZED") {
    adjustments.push("Add one growth-focused task daily");
  }

  return adjustments;
};

module.exports = {
  generateScheduleAdjustment,
};
