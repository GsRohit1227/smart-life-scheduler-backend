const { analyzeHealthRisk } = require("./intelligence/healthAnalyzer");

const health = analyzeHealthRisk({
  weeklyScore: {
    burnoutRisk: "LOW",
  },
  behaviorProfile: {
    sleepPattern: "HEALTHY",
    consistencyTrend: "IMPROVING",
  },
});

console.log("Health Risk Analysis:", health);
