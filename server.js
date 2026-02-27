require("dotenv").config();  

const helmet = require("helmet");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const limiter = require("./middleware/rateLimiter");
const startAutoRescheduler = require("./Jobs/autoRescheduler"); 

const app = express();

/* =========================================
   SECURITY MIDDLEWARE
========================================= */
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api", limiter);

/* =========================================
   ROUTES
========================================= */
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const intelligenceRoutes = require("./routes/intelligenceRoutes");
const intelligenceHistoryRoutes = require("./routes/intelligenceHistoryRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/intelligence", intelligenceRoutes);
app.use("/api/intelligence/history", intelligenceHistoryRoutes);

/* =========================================
   TEST ROUTE
========================================= */
app.get("/", (req, res) => {
  res.send("Smart Life Scheduler Backend is Running 🚀");
});

/* =========================================
   ERROR HANDLER
========================================= */
const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler);

/* =========================================
   DATABASE CONNECTION + SERVER START
========================================= */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");

    startAutoRescheduler(); // 👈 START CRON JOB

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed");
    console.error(err.message);
    process.exit(1);
  });
