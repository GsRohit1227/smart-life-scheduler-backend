const { generateScheduleAdjustment } = require("./intelligence/adaptiveRescheduler");

const adjustments = generateScheduleAdjustment({
  healthRisk: {
    riskLevel: "LOW",
  },
  behaviorProfile: {
    workloadStatus: "BALANCED",
  },
});

console.log("Schedule Adjustments:", adjustments);
