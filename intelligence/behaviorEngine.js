const analyzeBehavior = ({
  last7Days = {},
  last30Days = {},
}) => {
  const avg = (arr = []) =>
    !Array.isArray(arr) || arr.length === 0
      ? 0
      : arr.reduce((a, b) => a + b, 0) / arr.length;

  const completion7 = last7Days.completionRates || [];
  const completion30 = last30Days.completionRates || [];

  const sleep7 = last7Days.sleepHours || [];
  const sleep30 = last30Days.sleepHours || [];

  const missed7 = last7Days.missedTasks || [];

  const avg7Completion = avg(completion7);
  const avg30Completion = avg(completion30);

  const avg7Sleep = avg(sleep7);
  const avg30Sleep = avg(sleep30);

  const totalMissed7 = Array.isArray(missed7)
    ? missed7.reduce((a, b) => a + b, 0)
    : 0;

  let consistencyTrend = "STABLE";
  if (avg7Completion > avg30Completion + 0.05) {
    consistencyTrend = "IMPROVING";
  } else if (avg7Completion < avg30Completion - 0.05) {
    consistencyTrend = "DECLINING";
  }

  let sleepPattern = "HEALTHY";
  if (avg7Sleep < 5 || avg30Sleep < 5) {
    sleepPattern = "CRITICAL";
  } else if (avg7Sleep < 6 || avg30Sleep < 6) {
    sleepPattern = "IRREGULAR";
  }

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
