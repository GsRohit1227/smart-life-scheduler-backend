// intelligence/intelligenceEngine.js

const { calculateDailyScore, calculateWeeklyScore } = require("./scoringEngine");
const { analyzeBehavior } = require("./behaviorEngine");
const { analyzeHealthRisk } = require("./healthAnalyzer");
const { generateScheduleAdjustment } = require("./adaptiveRescheduler");

const runIntelligencePipeline = ({
  dailyData,
  weeklyData,
  last7Days,
  last30Days,
}) => {
  // 1️⃣ Scoring
  const dailyScore = calculateDailyScore(dailyData);
  const weeklyScore = calculateWeeklyScore(weeklyData);

  // 2️⃣ Behavior
  const behaviorProfile = analyzeBehavior({
    last7Days,
    last30Days,
  });

  // 3️⃣ Health Risk
  const healthRisk = analyzeHealthRisk({
    weeklyScore,
    behaviorProfile,
  });

  // 4️⃣ Adaptive Adjustments
  const scheduleAdjustments = generateScheduleAdjustment({
    healthRisk,
    behaviorProfile,
  });

  return {
    dailyScore,
    weeklyScore,
    behaviorProfile,
    healthRisk,
    scheduleAdjustments,
  };
};

module.exports = {
  runIntelligencePipeline,
};
