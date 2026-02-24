const { runIntelligencePipeline } = require("./intelligence/intelligenceEngine");

const result = runIntelligencePipeline({
  dailyData: {
    tasksCompleted: 9,
    totalTasks: 10,
    focusHours: 6,
  },
  weeklyData: {
    completionRate: 0.8,
    consistencyScore: 0.75,
    burnoutScore: 0.2,
  },
  last7Days: {
    completionRates: [0.7, 0.8, 0.6, 0.75, 0.9, 0.85, 0.8],
    sleepHours: [6, 7, 5, 6, 7, 6, 6],
    missedTasks: [1, 0, 2, 1, 0, 1, 0],
  },
  last30Days: {
    completionRates: Array(30).fill(0.65),
    sleepHours: Array(30).fill(6),
  },
});

console.log("FULL INTELLIGENCE REPORT:");
console.log(JSON.stringify(result, null, 2));
