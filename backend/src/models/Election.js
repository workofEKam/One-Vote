const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    scope: {
      department: {
        type: String,
        default: null, // null means no restriction (all departments / all years)
      },

      year: {
        type: Number,
        default: null,
      },
    },

    status: {
      type: String,
      enum: ["Upcoming", "Active", "Closed"],
      default: "Upcoming",
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Election", electionSchema);