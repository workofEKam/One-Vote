const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const studentMiddleware = require("../middleware/studentMiddleware");

const {createElection, getAllElections, getActiveElection, updateElectionStatus, getElectionStatistics} = require("../controllers/electionController");
const {getEligibleStudents,addCandidate,getCandidatesByElection,deleteCandidate} = require("../controllers/candidateController")
const { castVote, getElectionResults } = require("../controllers/voteController");
const router = express.Router();

router.post("/",authMiddleware,adminMiddleware,createElection);
router.get("/",authMiddleware,adminMiddleware,getAllElections);
router.get("/active",authMiddleware,getActiveElection);
router.patch("/:id/status",authMiddleware,adminMiddleware,updateElectionStatus,getElectionStatistics);
router.get("/:electionID/statistics",authMiddleware,adminMiddleware,getElectionStatistics
);

// candidate management
router.get("/:electionID/eligible-students",authMiddleware,adminMiddleware,getEligibleStudents);
router.post("/:electionID/candidates",authMiddleware,adminMiddleware,addCandidate);
router.get("/:electionID/candidates",authMiddleware,getCandidatesByElection);
router.delete("/:electionID/candidates/:candidateID",authMiddleware,adminMiddleware,deleteCandidate);

// vote management
router.post("/:electionID/vote",authMiddleware,studentMiddleware,castVote);

// results
router.get("/:electionID/results",authMiddleware,getElectionResults);
module.exports = router;