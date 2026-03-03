const aiService = require("../services/aiService");
const Task = require("../models/Task");

exports.chatWithAI = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    // Fetch user tasks
    const tasks = await Task.find({ user: userId });

    // Generate AI response
    const response = await aiService.generateResponse(message, tasks, userId);

    res.status(200).json({
      success: true,
      reply: response,
    });
  } catch (error) {
    next(error);
  }
};
