// intelligence/behaviorEngine.js

const analyzeBehavior = ({
  last7Days,
  last30Days,
}) => {
  const avg = (arr) =>
    arr.length === 0
      ? 0
      : arr.reduce((a, b) => a + b, 0) / arr.length;

  const avg7Completion = avg(last7Days.completionRates);
  const avg30Completion = avg(last30Days.completionRates);

  const avg7Sleep = avg(last7Days.sleepHours);
  const avg30Sleep = avg(last30Days.sleepHours);

  const totalMissed7 = last7Days.missedTasks.reduce((a, b) => a + b, 0);

  // 🔹 Consistency Trend
  let consistencyTrend = "STABLE";
  if (avg7Completion > avg30Completion + 0.05) {
    consistencyTrend = "IMPROVING";
  } else if (avg7Completion < avg30Completion - 0.05) {
    consistencyTrend = "DECLINING";
  }

  // 🔹 Sleep Pattern
  let sleepPattern = "HEALTHY";
  if (avg7Sleep < 5 || avg30Sleep < 5) {
    sleepPattern = "CRITICAL";
  } else if (avg7Sleep < 6 || avg30Sleep < 6) {
    sleepPattern = "IRREGULAR";
  }

  // 🔹 Workload Status
  let workloadStatus = "BALANCED";
  if (avg7Completion < 0.5 && totalMissed7 > 5) {
    workloadStatus = "OVERLOADED";
  } else if (avg7Completion > 0.9 && totalMissed7 === 0) {
    workloadStatus = "UNDERUTILIZED";
  }

  return {
    consistencyTrend,
    sleepPattern,
    workloadStatus,
  };
};

module.exports = {
  analyzeBehavior,
};