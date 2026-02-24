// intelligence/scoringEngine.js

const calculateDailyScore = ({ tasksCompleted, totalTasks, focusHours }) => {
  const completionRate =
    totalTasks === 0 ? 0 : tasksCompleted / totalTasks;

  const productivityScore = completionRate * 100;

  return {
    dailyScore: Math.round(productivityScore),
    completionRate: Math.round(completionRate * 100),
  };
};

const calculateWeeklyScore = ({
  completionRate,
  consistencyScore,
  burnoutScore,
}) => {
  const weeklyScore =
    completionRate * 0.5 +
    consistencyScore * 0.3 +
    (1 - burnoutScore) * 0.2;

  let burnoutRisk = "LOW";
  if (burnoutScore > 0.6) burnoutRisk = "HIGH";
  else if (burnoutScore > 0.3) burnoutRisk = "MEDIUM";

  let disciplineLevel = "AVERAGE";
  if (consistencyScore > 0.8) disciplineLevel = "HIGH";
  else if (consistencyScore < 0.4) disciplineLevel = "LOW";

  return {
    weeklyScore: Math.round(weeklyScore * 100),
    completionRate: Math.round(completionRate * 100),
    burnoutRisk,
    disciplineLevel,
  };
};

module.exports = {
  calculateDailyScore,
  calculateWeeklyScore,
};
