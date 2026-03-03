const calculateAdvancedAnalytics = require("./advancedAnalyticsService");

exports.generateResponse = async (message, tasks, userId) => {

  // ===== Weekly Trend Logic =====
  const now = new Date();

  const thisWeekStart = new Date();
  thisWeekStart.setDate(now.getDate() - 7);

  const lastWeekStart = new Date();
  lastWeekStart.setDate(now.getDate() - 14);

  const thisWeekTasks = tasks.filter(
    (t) => new Date(t.createdAt) >= thisWeekStart
  );

  const lastWeekTasks = tasks.filter(
    (t) =>
      new Date(t.createdAt) >= lastWeekStart &&
      new Date(t.createdAt) < thisWeekStart
  );

  const calculateScore = (taskList) => {
    const total = taskList.length;
    const completed = taskList.filter((t) => t.completed).length;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const overallScore = calculateScore(tasks);
  const thisWeekScore = calculateScore(thisWeekTasks);
  const lastWeekScore = calculateScore(lastWeekTasks);

  let trend = "stable";
  if (thisWeekScore > lastWeekScore) trend = "improving";
  if (thisWeekScore < lastWeekScore) trend = "declining";

  // ===== Advanced Intelligence =====
  const healthData = {
    sleepHours: 6,       // later we fetch real health data
    workoutDays: 2
  };

  const advanced = calculateAdvancedAnalytics(tasks, healthData);

  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("burnout")) {
    if (advanced.burnoutRisk) {
      return "Burnout risk detected. " + advanced.suggestions.join(" ");
    }
    return "No burnout risk detected. Keep balanced routine.";
  }

  if (lowerMessage.includes("health")) {
    return `Health score: ${advanced.healthScore}%. ${advanced.insights.join(" ")}`;
  }

  if (lowerMessage.includes("week")) {
    return `This week productivity is ${thisWeekScore}%. Compared to last week (${lastWeekScore}%), you are ${trend}.`;
  }

  if (lowerMessage.includes("productivity")) {
    return `Overall productivity is ${overallScore}%. Weekly trend: ${trend}.`;
  }

  return `Overall: ${overallScore}%. Health: ${advanced.healthScore}%. Trend: ${trend}.`;
};
