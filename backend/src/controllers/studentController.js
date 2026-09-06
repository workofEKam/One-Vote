const User = require("../models/User");
const bcrypt = require("bcryptjs");
const fs = require("fs/promises");

const readCSV = require("../utils/readCSV");
const validateStudentRows = require("../utils/validateStudentRows");

const importStudents = async (req, res, next) => {
    try {

        // upload csv
        const students = await readCSV(req.file.path);

        // validate in csv
        const { validRows, errors } = validateStudentRows(students);

        // validate uniqueness in db before inserting
        const rollNumbers = validRows.map((student) => student.rollNumber);

        const existingUsers = await User.find({
            rollNumber: {
                $in: rollNumbers,
            },
        }).select("rollNumber");

        // prepare students to import
        const existingRollNumbers = new Set(
            existingUsers.map((user) => user.rollNumber)
        );

        const studentsToImport = [];
        const skippedStudents = [];

        for (const student of validRows) {
            if (existingRollNumbers.has(student.rollNumber)) {
                skippedStudents.push({
                    rollNumber: student.rollNumber,
                    reason: "Student already exists.",
                });
                continue;
            }
            studentsToImport.push(student);
        }


        // inserting students in db
        const usersToInsert = [];
        for (const student of studentsToImport) {
            const hashedPassword = await bcrypt.hash(student.rollNumber, 10);
            usersToInsert.push({
                ...student,
                password: hashedPassword,
                role: "Student",
            });
        }

        if (usersToInsert.length > 0) {
            await User.insertMany(usersToInsert);
        }

        // return summary
        res.status(200).json({
            success: true,

            summary: {
                totalRows: students.length,
                imported: usersToInsert.length,
                skipped: skippedStudents.length,
                invalid: errors.length,
            },

            skippedStudents,
            errors,
        });

    } catch (error) {
        next(error);
    }
    finally {
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (err) {
                console.error("Failed to delete uploaded CSV:", err.message);
            }
        }
    }
};

const getStudents = async (req, res, next) => {
    try {

        const students = await User.find({
            role: "Student",
        })
            .select("name rollNumber email department year")
            .sort({
                rollNumber: 1,
            });

        res.status(200).json({
            success: true,
            count: students.length,
            students,
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    importStudents,
    getStudents,
};