const { analyzeBehavior } = require("./intelligence/behaviorEngine");

const behavior = analyzeBehavior({
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

console.log("Behavior Analysis:", behavior);