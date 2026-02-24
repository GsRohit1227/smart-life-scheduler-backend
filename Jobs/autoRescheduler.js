const cron = require("node-cron");
const Task = require("../models/Task");

// 🔥 Daily Auto Rescheduler
const startAutoRescheduler = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ Running Daily Auto Rescheduler...");

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdueTasks = await Task.find({
        completed: false,
        date: { $lt: today },
        rescheduledCount: { $lt: 5 },
      });

      for (let task of overdueTasks) {
        let basePush = 1;

        if (task.priority === "High") basePush = 1;
        else if (task.priority === "Medium") basePush = 2;
        else basePush = 3;

        if (task.healthScore && task.healthScore < 40) {
          basePush += 1;
        }

        let newDate = new Date(task.date);

        while (
          newDate < today &&
          (task.rescheduledCount || 0) < 5
        ) {
          newDate.setDate(newDate.getDate() + basePush);
          task.rescheduledCount += 1;
        }

        task.date = newDate;
        await task.save();
      }

      console.log(`✅ Rescheduled ${overdueTasks.length} tasks`);
    } catch (error) {
      console.error("❌ Cron Job Error:", error.message);
    }
  });

  console.log("🚀 Auto Rescheduler Cron Started");
};

module.exports = startAutoRescheduler;
