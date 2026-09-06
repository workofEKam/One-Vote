const ALLOWED_DEPARTMENTS = [
    "CSE",
    "DSE",
    "ECE",
    "IT",
    "ME",
    "CE",
    "EE",
];

const validateStudentRows = (students) => {
    const rollNumbers = new Set();
    const emails = new Set();
    const validRows = [];
    const errors = [];

    students.forEach((student, index) => {
        // basic validations
        const rowNumber = index + 2;

        if (!student.name ||!student.rollNumber ||!student.email ||!student.department ||!student.year) {
            errors.push({
                row: rowNumber,
                message: "All fields are required.",
            });
            return;
        }

        if (!ALLOWED_DEPARTMENTS.includes(student.department)) {

            errors.push({
                row: rowNumber,
                message: "Invalid department.",
            });

            return;
        }

        const year = Number(student.year);

        if (year < 1 || year > 4) {
            errors.push({
                row: rowNumber,
                message: "Year must be between 1 and 4.",
            });

            return;
        }
         
        // checks duplicacy in csv
        if (rollNumbers.has(student.rollNumber)) {
            errors.push({
                row: rowNumber,
                message: "Duplicate roll number in CSV.",
            });

            return;
        }

        rollNumbers.add(student.rollNumber);

        if (emails.has(student.email)) {
            errors.push({
                row: rowNumber,
                message: "Duplicate email in CSV.",
            });

            return;
        }

        emails.add(student.email);
        student.year = year;
        validRows.push(student);

    });

    return {
        validRows,
        errors,
    };

};

module.exports = validateStudentRows;