const studentMiddleware = (req, res, next) => {
    if (req.user.role !== "Student") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Students only.",
        });
    }

    next();
};

module.exports = studentMiddleware;