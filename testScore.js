const {
  calculateDailyScore,
  calculateWeeklyScore,
} = require("./intelligence/scoringEngine");

// Test Daily Score
const daily = calculateDailyScore({
  totalTasks: 10,
  completedTasks: 8,
  sleepHours: 7,
  workoutDone: true,
  focusSessions: 3,
});

console.log("Daily Score Test:", daily);

// Test Weekly Score
const weekly = calculateWeeklyScore({
  weeklyTasks: 50,
  weeklyCompleted: 40,
  avgSleep: 7,
  workoutDays: 4,
  missedTasks: 3,
});

console.log("Weekly Score Test:", weekly);
