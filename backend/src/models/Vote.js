const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate",
            required: true,
        },

        election: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Election",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// One student can vote only once in one election
voteSchema.index(
    { student: 1, election: 1 },
    { unique: true }
);

module.exports = mongoose.model("Vote", voteSchema);