const User = require("../models/User");
const Election = require("../models/Election");
const Candidate = require("../models/Candidate");

const getEligibleStudents = async (req, res, next) => {
    try {
        const { electionID } = req.params;

        // Check if election exists
        const election = await Election.findById(electionID);

        if (!election) {
            return res.status(404).json({
                success: false,
                message: "Election not found.",
            });
        }

        // Get all candidates for this election
        const candidates = await Candidate.find(
            { election: electionID },
            "user"
        );

        // Extract candidate user IDs
        const candidateIDs = candidates.map(candidate => candidate.user);

        // Build query dynamically based on election scope
        const studentQuery = {
            role: "Student",
            _id: { $nin: candidateIDs },
        };

        if (election.scope?.department) {
            studentQuery.department = election.scope.department;
        }

        if (election.scope?.year !== null && election.scope?.year !== undefined) {
            studentQuery.year = election.scope.year;
        }

        // Fetch eligible students
        const students = await User.find(studentQuery)
            .select("name rollNumber department year")
            .sort({ rollNumber: 1 });

        res.status(200).json({
            success: true,
            count: students.length,
            students,
        });

    } catch (error) {
        next(error);
    }
};

const addCandidate = async (req, res, next) => {
    try {
        const { electionID } = req.params;
        const { userId, agenda } = req.body;

        if (!userId || !agenda) {
            return res.status(400).json({
                success: false,
                message: "userId and agenda are required.",
            });
        }

        // Check election
        const election = await Election.findById(electionID);

        if (!election) {
            return res.status(404).json({
                success: false,
                message: "Election not found.",
            });
        }

        // Election must be upcoming
        if (election.status !== "Upcoming") {
            return res.status(400).json({
                success: false,
                message: "Candidates can only be added before the election starts.",
            });
        }

        // Check student
        const student = await User.findById(userId);

        if (!student || student.role !== "Student") {
            return res.status(404).json({
                success: false,
                message: "Student not found.",
            });
        }

        // Check if student belongs to election scope
        if (
            election.scope?.department &&
            student.department !== election.scope.department
        ) {
            return res.status(400).json({
                success: false,
                message: "Student does not belong to the eligible department.",
            });
        }

        if (
            election.scope?.year !== null &&
            election.scope?.year !== undefined &&
            student.year !== election.scope.year
        ) {
            return res.status(400).json({
                success: false,
                message: "Student does not belong to the eligible year.",
            });
        }

        // Check duplicate
        const existingCandidate = await Candidate.findOne({
            user: userId,
            election: electionID,
        });

        if (existingCandidate) {
            return res.status(409).json({
                success: false,
                message: "Student is already a candidate in this election.",
            });
        }

        const candidate = await Candidate.create({
            user: userId,
            election: electionID,
            agenda,
        });

        res.status(201).json({
            success: true,
            message: "Candidate added successfully.",
            candidate,
        });

    } catch (error) {
        next(error);
    }
};

const getCandidatesByElection = async (req, res, next) => {
    try {
        const { electionID } = req.params;

        // Check election exists
        const election = await Election.findById(electionID);

        if (!election) {
            return res.status(404).json({
                success: false,
                message: "Election not found.",
            });
        }

        const candidates = await Candidate.find({
            election: electionID,
        })
            .populate(
                "user",
                "name rollNumber department year"
            )
            .sort({
                createdAt: 1,
            });

        res.status(200).json({
            success: true,
            count: candidates.length,
            candidates,
        });

    } catch (error) {
        next(error);
    }
};

const deleteCandidate = async (req, res, next) => {
    try {
        const { electionID, candidateID } = req.params;

        // Check election
        const election = await Election.findById(electionID);

        if (!election) {
            return res.status(404).json({
                success: false,
                message: "Election not found.",
            });
        }

        // Only allow deletion before election starts
        if (election.status !== "Upcoming") {
            return res.status(400).json({
                success: false,
                message: "Candidates cannot be removed after the election starts.",
            });
        }

        // Find candidate
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

        await Candidate.findByIdAndDelete(candidateID);

        res.status(200).json({
            success: true,
            message: "Candidate removed successfully.",
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEligibleStudents,
    addCandidate,
    getCandidatesByElection,
    deleteCandidate,
};