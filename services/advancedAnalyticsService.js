const calculateAdvancedAnalytics = (tasks, healthData) => {
  let insights = [];
  let suggestions = [];

  /* =========================
     PRODUCTIVITY SCORE
  ========================== */

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;

  let productivityScore = totalTasks === 0
    ? 0
    : Math.round((completedTasks / totalTasks) * 100);

  if (productivityScore < 50) {
    insights.push("Low task completion rate this period.");
    suggestions.push("Try reducing daily task overload.");
  }

  if (productivityScore > 80) {
    insights.push("Excellent productivity performance.");
  }

  /* =========================
     HEALTH SCORE
  ========================== */

  const sleepHours = healthData.sleepHours || 0;
  const workoutDays = healthData.workoutDays || 0;

  let healthScore = 0;

  // Sleep scoring
  if (sleepHours >= 7 && sleepHours <= 8) {
    healthScore += 50;
  } else if (sleepHours >= 6) {
    healthScore += 30;
    insights.push("Sleep slightly below optimal.");
    suggestions.push("Aim for 7-8 hours of sleep.");
  } else {
    healthScore += 10;
    insights.push("Poor sleep detected.");
    suggestions.push("Prioritize sleep to avoid burnout.");
  }

  // Workout scoring
  if (workoutDays >= 4) {
    healthScore += 50;
  } else if (workoutDays >= 2) {
    healthScore += 30;
    insights.push("Workout consistency can improve.");
  } else {
    healthScore += 10;
    insights.push("Low physical activity detected.");
    suggestions.push("Add at least 3 workout days per week.");
  }

  healthScore = Math.min(healthScore, 100);

  /* =========================
     BURNOUT DETECTION
  ========================== */

  let burnoutRisk = false;

  if (productivityScore > 85 && sleepHours < 6) {
    burnoutRisk = true;
    insights.push("High productivity but low sleep — burnout risk.");
    suggestions.push("Schedule rest days to recover.");
  }

  return {
    productivityScore,
    healthScore,
    burnoutRisk,
    insights,
    suggestions,
  };
};

module.exports = calculateAdvancedAnalytics;