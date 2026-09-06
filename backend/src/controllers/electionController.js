const Election = require("../models/Election");
const Candidate = require("../models/Candidate");
const User = require("../models/User");
const Vote = require("../models/Vote");

const createElection = async (req, res, next) => {
    try {
        const { title, description, scope = {}, startDate, endDate } = req.body;

        // Validate input
        if (!title || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields.",
            });
        }

        // Validate dates
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({
                success: false,
                message: "End date must be after start date.",
            });
        }

        const election = await Election.create({
            title,
            description,
            scope: {
                department: scope.department ?? null,
                year: scope.year ?? null,
            },
            startDate,
            endDate,
        });

        res.status(201).json({
            success: true,
            message: "Election created successfully.",
            election,
        });

    } catch (error) {
        next(error);
    }
};

const getAllElections = async (req, res, next) => {
    try {
        const elections = await Election.find().sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            count: elections.length,
            elections,
        });

    } catch (error) {
        next(error);
    }
};

const getActiveElection = async (req, res, next) => {
    try {
        const election = await Election.findOne({
            status: "Active",
        });

        if (!election) {
            return res.status(404).json({
                success: false,
                message: "No active election found.",
            });
        }

        res.status(200).json({
            success: true,
            election,
        });

    } catch (error) {
        next(error);
    }
};

const updateElectionStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        // Validate status
        if (!["Upcoming", "Active", "Closed"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status.",
            });
        }

        // Business Rule
        if (status === "Active") {
            const candidateCount = await Candidate.countDocuments({
                election: id,
            });

            if (candidateCount < 2) {
                return res.status(400).json({
                    success: false,
                    message:
                        "At least two candidates are required to activate an election.",
                });
            }
            const activeElection = await Election.findOne({
                status: "Active",
            });
            if (
                activeElection &&
                activeElection._id.toString() !== id
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Another election is already active.",
                });
            }
        }

        const election = await Election.findByIdAndUpdate(
            id,
            { status },
            { returnDocument: "after" }
        );

        if (!election) {
            return res.status(404).json({
                success: false,
                message: "Election not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Election status updated.",
            election,
        });

    } catch (error) {
        next(error);
    }
};

const getElectionStatistics = async (req, res, next) => {
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

        // Build query for eligible students
        const studentQuery = {
            role: "Student",
        };

        if (election.scope?.department) {
            studentQuery.department = election.scope.department;
        }

        if (
            election.scope?.year !== null &&
            election.scope?.year !== undefined
        ) {
            studentQuery.year = election.scope.year;
        }

        // Counts
        const eligibleStudents = await User.countDocuments(studentQuery);

        const candidateCount = await Candidate.countDocuments({
            election: electionID,
        });

        const votesCast = await Vote.countDocuments({
            election: electionID,
        });

        const turnout =
            eligibleStudents === 0
                ? 0
                : Number(
                      (
                          (votesCast / eligibleStudents) *
                          100
                      ).toFixed(2)
                  );

        res.status(200).json({
            success: true,
            statistics: {
                status: election.status,
                eligibleStudents,
                candidateCount,
                votesCast,
                turnout,
            },
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createElection,
    getAllElections,
    getActiveElection,
    updateElectionStatus,
    getElectionStatistics,
};