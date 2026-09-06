const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");
const Election = require("../models/Election");

const castVote = async (req, res, next) => {
    try {
        const { electionID } = req.params;
        const { candidateID } = req.body;

        // 1. Check election
        const election = await Election.findById(electionID);

        if (!election) {
            return res.status(404).json({
                success: false,
                message: "Election not found.",
            });
        }

        // 2. Election must be active
        if (election.status !== "Active") {
            return res.status(400).json({
                success: false,
                message: "Voting is not active for this election.",
            });
        }

        // 3. Check candidate belongs to this election
        // Accept either the candidate document `_id` or the candidate `user` id
        const candidate = await Candidate.findOne({
            _id: candidateID,
            election: electionID,
        });

        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: "Candidate not found.",
            });
        }

        // Check if student is eligible for this election
        if (
            election.scope?.department &&
            req.user.department !== election.scope.department
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not eligible to vote in this election.",
            });
        }

        if (
            election.scope?.year !== null &&
            election.scope?.year !== undefined &&
            req.user.year !== election.scope.year
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not eligible to vote in this election.",
            });
        }
        // 4. Check if student already voted
        const existingVote = await Vote.findOne({
            student: req.user._id,
            election: electionID,
        });

        if (existingVote) {
            return res.status(409).json({
                success: false,
                message: "You have already voted in this election.",
            });
        }

        // 5. Record the vote
        await Vote.create({
            student: req.user._id,
            candidate: candidate._id,
            election: electionID,
        });

        // 6. Increment vote count (use the loaded candidate document)
        await Candidate.findByIdAndUpdate(
            candidate._id,
            {
                $inc: {
                    voteCount: 1,
                },
            }
        );

        res.status(201).json({
            success: true,
            message: "Vote cast successfully.",
        });

    } catch (error) {
        next(error);
    }
};

const getElectionResults = async (req, res, next) => {
    try {
        const { electionID } = req.params;

        // Check election
        const election = await Election.findById(electionID);

        if (!election) {
            return res.status(404).json({
                success: false,
                message: "Election not found.",
            });
        }

        // Results only after election is closed
        if (election.status !== "Closed") {
            return res.status(400).json({
                success: false,
                message: "Results are available only after the election is closed.",
            });
        }

        const results = await Candidate.find({
            election: electionID,
        })
            .populate(
                "user",
                "name rollNumber department year"
            )
            .sort({
                voteCount: -1,
            });

        res.status(200).json({
            success: true,
            count: results.length,
            results,
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    castVote,
    getElectionResults,
};