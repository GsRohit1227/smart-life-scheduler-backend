const express = require("express");
const protect = require("../middleware/authMiddleware");
const Task = require("../models/Task");

const { body } = require("express-validator");
const { validateTaskCreation, validateTaskUpdate } = require("../middleware/validationMiddleware");

const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();
  

/* =========================================
   CREATE TASK (Auto Schedule Optimizer)
========================================= */
 router.post(
  "/",
  protect,
  validateTaskCreation,
  asyncHandler(async (req, res) => {
    const {
      title,
      description,
      date,
      priority,
      duration,
      deadline,
      startTime,
    } = req.body;

    const taskDate = new Date(date);

    // Convert HH:mm to minutes
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    let newStartMinutes = timeToMinutes(startTime);
    let newEndMinutes = newStartMinutes + duration;

    // Get start and end of the day
    const startOfDay = new Date(taskDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(taskDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch tasks for the same day
    const sameDayTasks = await Task.find({
      user: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    // Conflict detection
    let conflictFound = true;

    while (conflictFound) {
      conflictFound = false;

      for (let task of sameDayTasks) {
        if (!task.startTime) continue;

        const existingStart = timeToMinutes(task.startTime);
        const existingEnd = existingStart + (task.duration || 0);

        if (
          newStartMinutes < existingEnd &&
          newEndMinutes > existingStart
        ) {
          // Push forward after existing task
          newStartMinutes = existingEnd;
          newEndMinutes = newStartMinutes + duration;
          conflictFound = true;
        }
      }
    }

    // Convert minutes back to HH:mm
    const minutesToTime = (minutes) => {
      const hrs = Math.floor(minutes / 60)
        .toString()
        .padStart(2, "0");
      const mins = (minutes % 60)
        .toString()
        .padStart(2, "0");

      return `${hrs}:${mins}`;
    };

    const optimizedStartTime = minutesToTime(newStartMinutes);

    const task = await Task.create({
      user: req.user.id,
      title,
      description,
      date: taskDate,
      priority,
      duration,
      deadline,
      startTime: optimizedStartTime,
      rescheduledCount: 0,
    });

    res.status(201).json({
      message: "Task created successfully (Optimized)",
      task,
    });
  })
);

/* =========================================
   GET ALL TASKS
========================================= */
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const {
      completed,
      date,
      from,
      to,
      page = 1,
      limit = 5,
    } = req.query;

    let filter = { user: req.user._id };

    if (completed !== undefined) {
      filter.completed = completed === "true";
    }

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.date = { $gte: start, $lte: end };
    }

    if (from && to) {
      filter.date = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await Task.countDocuments(filter);

    res.status(200).json({
      totalTasks: total,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      tasks,
    });
})
);
   /* =========================================
   GET SINGLE TASK
========================================= */
router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  })
);
   /* =========================================
   TOGGLE TASK COMPLETE (PATCH)
========================================= */
router.patch(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (req.body.completed !== undefined) {
      task.completed = req.body.completed;
    }

    await task.save();

    res.status(200).json({
      success: true,
      task,
    });
  })
);
/* =========================================
   SMART AUTO RESCHEDULE (VERSION 2)
========================================= */
router.put(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const {
      title,
      description,
      date,
      completed,
      priority,
      duration,
      deadline,
      sleepHours,
      stressLevel,
      workload,
      missedTasks,
    } = req.body;

    // 🧠 HEALTH SCORE CALCULATION
    let calculatedHealthScore = 100;

    if (sleepHours !== undefined) {
      if (sleepHours < 4) calculatedHealthScore -= 25;
      else if (sleepHours < 6) calculatedHealthScore -= 15;
    }

    if (stressLevel !== undefined) {
      calculatedHealthScore -= stressLevel * 2;
    }

    if (workload !== undefined) {
      calculatedHealthScore -= workload * 2;
    }

    if (missedTasks !== undefined) {
      calculatedHealthScore -= missedTasks * 5;
    }

    if (calculatedHealthScore < 0) {
      calculatedHealthScore = 0;
    }

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (date !== undefined) task.date = date;
    if (priority !== undefined) task.priority = priority;
    if (duration !== undefined) task.duration = duration;
    if (deadline !== undefined) task.deadline = deadline;

    // 🔥 SMART AUTO RESCHEDULING
    if (completed === false) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (!task.rescheduledCount) task.rescheduledCount = 0;

      if (task.date < today && task.rescheduledCount < 5) {
        let basePush = 1;

        if (task.priority === "High") basePush = 1;
        else if (task.priority === "Medium") basePush = 2;
        else basePush = 3;

        if (calculatedHealthScore < 40) {
          basePush += 1;
        }

        let newDate = new Date(task.date);

        while (newDate < today && task.rescheduledCount < 5) {
          newDate.setDate(newDate.getDate() + basePush);
          task.rescheduledCount += 1;
        }

        task.date = newDate;
      }
    }

    if (completed !== undefined) {
      task.completed = completed;
    }

    // 📌 OVERDUE CHECK
    const todayCheck = new Date();
    todayCheck.setHours(0, 0, 0, 0);

    if (task.date < todayCheck && task.completed === false) {
      task.isOverdue = true;
    } else {
      task.isOverdue = false;
    }

    task.healthScore = calculatedHealthScore;

    await task.save();

    res.status(200).json({
      message: "Task updated successfully",
      healthScore: calculatedHealthScore,
      updatedTask: task,
    });
  })
);


/* =========================================
   DELETE TASK
========================================= */
 router.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  })
);

/* =========================================
   DASHBOARD SUMMARY API
========================================= */
router.get("/dashboard/summary", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalTasks = await Task.countDocuments({ user: userId });
    const completedTasks = await Task.countDocuments({
      user: userId,
      completed: true,
    });
    const pendingTasks = await Task.countDocuments({
      user: userId,
      completed: false,
    });
    const overdueTasks = await Task.countDocuments({
      user: userId,
      isOverdue: true,
    });

    const tasks = await Task.find({ user: userId });

    let totalHealth = 0;
    tasks.forEach((task) => {
      totalHealth += task.healthScore || 0;
    });

    const avgHealthScore =
      tasks.length > 0
        ? Math.round(totalHealth / tasks.length)
        : 0;

    const productivity =
      totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    res.status(200).json({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      avgHealthScore,
      productivityPercentage: productivity,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/* =========================================
   WEEKLY ANALYTICS API
========================================= */
router.get("/dashboard/weekly", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const today = new Date();

    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());
    firstDayOfWeek.setHours(0, 0, 0, 0);

    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);

    const weeklyTasks = await Task.find({
      user: userId,
      createdAt: {
        $gte: firstDayOfWeek,
        $lte: lastDayOfWeek,
      },
    });

    const totalWeeklyTasks = weeklyTasks.length;

    const completedWeeklyTasks = weeklyTasks.filter(
      (task) => task.completed
    ).length;

    const pendingWeeklyTasks =
      totalWeeklyTasks - completedWeeklyTasks;

    let totalHealth = 0;
    weeklyTasks.forEach((task) => {
      totalHealth += task.healthScore || 0;
    });

    const avgWeeklyHealth =
      totalWeeklyTasks > 0
        ? Math.round(totalHealth / totalWeeklyTasks)
        : 0;

    const weeklyProductivity =
      totalWeeklyTasks > 0
        ? Math.round(
            (completedWeeklyTasks / totalWeeklyTasks) * 100
          )
        : 0;

    res.status(200).json({
      weekStart: firstDayOfWeek,
      weekEnd: lastDayOfWeek,
      totalWeeklyTasks,
      completedWeeklyTasks,
      pendingWeeklyTasks,
      avgWeeklyHealth,
      weeklyProductivityPercentage: weeklyProductivity,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/* =========================================
   PRODUCTIVITY SCORE API
========================================= */
router.get(
  "/dashboard/productivity-score",
  protect,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const totalTasks = await Task.countDocuments({
        user: userId,
      });

      const completedTasks = await Task.countDocuments({
        user: userId,
        completed: true,
      });

      const overdueTasks = await Task.countDocuments({
        user: userId,
        isOverdue: true,
      });

      const tasks = await Task.find({ user: userId });

      let totalHealth = 0;
      tasks.forEach((task) => {
        totalHealth += task.healthScore || 0;
      });

      const avgHealthScore =
        totalTasks > 0 ? totalHealth / totalTasks : 0;

      const completionScore =
        totalTasks > 0
          ? (completedTasks / totalTasks) * 50
          : 0;

      const healthScoreComponent =
        (avgHealthScore / 100) * 40;

      const overduePenalty =
        totalTasks > 0
          ? (overdueTasks / totalTasks) * 10
          : 0;

      let finalScore =
        completionScore +
        healthScoreComponent -
        overduePenalty;

      if (finalScore < 0) finalScore = 0;
      if (finalScore > 100) finalScore = 100;

      finalScore = Math.round(finalScore);

      res.status(200).json({
        totalTasks,
        completedTasks,
        overdueTasks,
        avgHealthScore: Math.round(avgHealthScore),
        productivityScore: finalScore,
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);


/* =========================================
   SMART RECOMMENDATION API
========================================= */
router.get(
  "/dashboard/recommendations",
  protect,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const totalTasks = await Task.countDocuments({
        user: userId,
      });

      const completedTasks = await Task.countDocuments({
        user: userId,
        completed: true,
      });

      const overdueTasks = await Task.countDocuments({
        user: userId,
        isOverdue: true,
      });

      const tasks = await Task.find({ user: userId });

      let totalHealth = 0;
      tasks.forEach((task) => {
        totalHealth += task.healthScore || 0;
      });

      const avgHealthScore =
        totalTasks > 0 ? totalHealth / totalTasks : 0;

      const productivity =
        totalTasks > 0
          ? (completedTasks / totalTasks) * 100
          : 0;

      const recommendations = [];

      if (productivity < 40) {
        recommendations.push(
          "Your productivity is low. Try completing smaller tasks first."
        );
      }

      if (avgHealthScore < 60) {
        recommendations.push(
          "Your health score is dropping. Improve sleep and reduce stress."
        );
      }

      if (overdueTasks > 0) {
        recommendations.push(
          "You have overdue tasks. Prioritize high impact items immediately."
        );
      }

      if (totalTasks - completedTasks > 5) {
        recommendations.push(
          "You have many pending tasks. Consider breaking them into smaller goals."
        );
      }

      if (recommendations.length === 0) {
        recommendations.push(
          "Great job! You are maintaining a healthy and productive schedule."
        );
      }

      res.status(200).json({
        productivityScore: Math.round(productivity),
        avgHealthScore: Math.round(avgHealthScore),
        overdueTasks,
        recommendations,
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
