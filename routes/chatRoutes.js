const express = require("express");
const protect = require("../middleware/authMiddleware");
const chatController = require("../controllers/chatController");

const router = express.Router();

router.post("/", protect, chatController.chatWithAI);

module.exports = router;