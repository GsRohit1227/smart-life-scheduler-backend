const IntelligenceHistory = require("../models/IntelligenceHistory");

exports.getHistory = async (req, res) => {
  const history = await IntelligenceHistory.find({
    user: req.user._id,
  }).sort({ createdAt: -1 });

  res.json(history);
};

exports.getSingleHistory = async (req, res) => {
  const report = await IntelligenceHistory.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  res.json(report);
};
