const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        election: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Election",
            required: true,
        },

        agenda: {
            type: String,
            trim: true,
            default: "",
        },

        voteCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

candidateSchema.index(
    { user: 1, election: 1 },
    { unique: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);