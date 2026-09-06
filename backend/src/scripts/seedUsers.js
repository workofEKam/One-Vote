require("dotenv").config();

const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

const seedUsers = async () => {
    try {
        await connectDB();

        // Remove existing users
        await User.deleteMany();

        // Hash passwords
        const adminPassword = await bcrypt.hash("admin123", 10);
        const studentPassword1 = await bcrypt.hash("09122004", 10);
        const studentPassword2 = await bcrypt.hash("15032005", 10);
        const studentPassword3 = await bcrypt.hash("20112004", 10);

        // Create users
        await User.insertMany([
            {
                name: "Admin",
                rollNumber: "ADMIN001",
                email: "admin@onevote.com",
                password: adminPassword,
                department: "Administration",
                year: 1,
                role: "Admin",
            },
            {
                name: "Harleen Kaur",
                rollNumber: "23DSE001",
                email: "harleen@college.edu",
                password: studentPassword1,
                department: "Data Science",
                year: 3,
                role: "Student",
            },
            {
                name: "Aman Sharma",
                rollNumber: "23CSE015",
                email: "aman@college.edu",
                password: studentPassword2,
                department: "Computer Science",
                year: 3,
                role: "Student",
            },
            {
                name: "Priya Singh",
                rollNumber: "23ECE022",
                email: "priya@college.edu",
                password: studentPassword3,
                department: "Electronics",
                year: 3,
                role: "Student",
            },
            {
                name: "Rohit Verma",
                rollNumber: "23MECH010",
                email: "rohit@college.edu",
                password: studentPassword1,
                department: "Mechanical",
                year: 2,
                role: "Student",
            },
            {
                name: "Sneha Gupta",
                rollNumber: "23CIV005",
                email: "sneha@college.edu",
                password: studentPassword2,
                department: "Civil",
                year: 4,
                role: "Student",
            },
            {
                name: "Karan Gill",
                rollNumber: "23IT007",
                email: "karan@college.edu",
                password: studentPassword3,
                department: "Information Technology",
                year: 2,
                role: "Student",
            },
            {
                name: "Simranjeet Kaur",
                rollNumber: "23BIO011",
                email: "simran@college.edu",
                password: studentPassword1,
                department: "Biotechnology",
                year: 3,
                role: "Student",
            },
            {
                name: "Arjun Mehta",
                rollNumber: "23MATH009",
                email: "arjun@college.edu",
                password: studentPassword2,
                department: "Mathematics",
                year: 1,
                role: "Student",
            },
            {
                name: "Neha Rani",
                rollNumber: "23PHY008",
                email: "neha@college.edu",
                password: studentPassword3,
                department: "Physics",
                year: 2,
                role: "Student",
            },
            {
                name: "Vikas Kumar",
                rollNumber: "23CHE012",
                email: "vikas@college.edu",
                password: studentPassword1,
                department: "Chemistry",
                year: 4,
                role: "Student",
            },
        ]);

        console.log("Users seeded successfully!");
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedUsers();