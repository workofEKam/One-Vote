const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const uploadCSV = require("../middleware/uploadCSV");

const {importStudents,getStudents,} = require("../controllers/studentController");

const router = express.Router();

// Student Management
router.post("/import",authMiddleware,adminMiddleware,uploadCSV.single("students"),importStudents);
router.get("/",authMiddleware,adminMiddleware,getStudents);

module.exports = router;