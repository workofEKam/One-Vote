const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const loginUser = async (req, res, next) => {
    try {
        const { rollNumber, password } = req.body;

        // 1. Validate input
        if (!rollNumber || !password) {
            return res.status(400).json({
                success: false,
                message: "Roll number and password are required",
            });
        }

        // 2. Find user
        const user = await User.findOne({
            rollNumber: rollNumber.toUpperCase(),
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // 3. Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // 4. Remove password before sending response
        const token = generateToken(user._id, user.role);
        user.password = undefined;

        return res
            .cookie("token", token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
            })
            .status(200)
            .json({
                success: true,
                message: "Login successful",
                user,
            });

    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
};

module.exports = {
    loginUser,
    getProfile,
};