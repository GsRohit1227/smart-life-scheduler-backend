const mongoose = require("mongoose");

const intelligenceHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["weekly", "monthly"],
      required: true,
    },

    productivityScore: {
      type: Number,
      required: true,
    },

    healthScore: {
      type: Number,
      required: true,
    },

    insights: {
      type: [String],
      default: [],
    },

    suggestions: {
      type: [String],
      default: [],
    },

    rawDataSnapshot: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "IntelligenceHistory",
  intelligenceHistorySchema
);
