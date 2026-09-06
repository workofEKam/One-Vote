const express = require("express");

const { loginUser, getProfile, logoutUser } = require("../controllers/authController");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/profile", authMiddleware, getProfile);

module.exports = router;