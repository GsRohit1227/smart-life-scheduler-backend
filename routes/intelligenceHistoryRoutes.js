const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getHistory,
  getSingleHistory,
} = require("../controllers/intelligenceHistoryController");

router.get("/", protect, getHistory);
router.get("/:id", protect, getSingleHistory);

module.exports = router;