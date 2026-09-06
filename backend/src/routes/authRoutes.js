const express = require("express");

const { loginUser, getProfile } = require("../controllers/authController");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/login", loginUser);
router.get("/profile", authMiddleware, getProfile);

module.exports = router;