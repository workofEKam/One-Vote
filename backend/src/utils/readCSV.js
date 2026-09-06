const fs = require("fs");
const csv = require("csv-parser");

const readCSV = (filePath) => {
    return new Promise((resolve, reject) => {

        const rows = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                rows.push(row);
            })
            .on("end", () => {
                resolve(rows);
            })
            .on("error", (error) => {
                reject(error);
            });

    });
};

module.exports = readCSV;