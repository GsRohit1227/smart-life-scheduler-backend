const { body, validationResult } = require("express-validator");

// Common error handler
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => err.msg),
    });
  }

  next();
};

// Task Creation Validation
const validateTaskCreation = [
  body("title")
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 3 }).withMessage("Title must be at least 3 characters"),

  body("date")
    .notEmpty().withMessage("Date is required")
    .isISO8601().withMessage("Date must be valid ISO format"),

  body("startTime")
    .notEmpty().withMessage("Start time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Start time must be in HH:mm format"),

  body("duration")
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive number"),

  body("priority")
    .isIn(["High", "Medium", "Low"])
    .withMessage("Priority must be High, Medium, or Low"),

  validate,
];

// Task Update Validation
const validateTaskUpdate = [
  body("sleepHours")
    .optional()
    .isFloat({ min: 0, max: 24 })
    .withMessage("Sleep hours must be between 0 and 24"),

  body("stressLevel")
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage("Stress level must be between 0 and 10"),

  body("workload")
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage("Workload must be between 0 and 10"),

  body("missedTasks")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Missed tasks must be 0 or greater"),

  validate,
];

module.exports = {
  validate,
  validateTaskCreation,
  validateTaskUpdate,
};
