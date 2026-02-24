const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // 🔹 Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
  }

  // 🔹 Invalid ObjectId (Cast Error)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  // 🔹 Duplicate Key Error (MongoDB)
  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value entered";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;