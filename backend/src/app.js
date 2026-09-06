const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

const authRoutes = require("./routes/authRoutes");
const electionRoutes = require("./routes/electionRoutes");
const studentRoutes = require("./routes/studentRoutes");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

// global middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// routes
app.get("/", (req,res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to OneVote API",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/students", studentRoutes);

// error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;