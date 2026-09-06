const multer = require("multer");
const path = require("path");

// Configure where uploaded files will be stored
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },

    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    },
});

// Allow only CSV files
const fileFilter = (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== ".csv") {
        return cb(new Error("Only CSV files are allowed."));
    }

    cb(null, true);
};

const uploadCSV = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2 MB
    },
});

module.exports = uploadCSV;