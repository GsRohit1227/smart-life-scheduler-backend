
const adaptiveReschedule = (tasks = [], energyLevel = "medium") => {
  let rescheduledTasks = [];
  let overloadWarning = false;

  const missedTasks = tasks.filter(task => 
    task.completed === false && new Date(task.dueDate) < new Date()
  );

  const upcomingTasks = tasks.filter(task =>
    new Date(task.dueDate) >= new Date()
  );

  // Priority sorting (high → low)
  missedTasks.sort((a, b) => b.priority - a.priority);

  let dailyCapacity = 5;

  if (energyLevel === "low") dailyCapacity = 3;
  if (energyLevel === "high") dailyCapacity = 7;

  let scheduledCount = upcomingTasks.length;

  missedTasks.forEach(task => {
    if (scheduledCount < dailyCapacity) {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 1);

      rescheduledTasks.push({
        ...task,
        newDueDate: newDate,
      });

      scheduledCount++;
    } else {
      overloadWarning = true;
    }
  });

  return {
    rescheduledTasks,
    overloadWarning,
  };
};

module.exports = adaptiveReschedule;