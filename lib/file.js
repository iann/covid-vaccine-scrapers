const fs = require("fs");

/**
 *
 * read in a file
 *
 * @param {string} filePath
 * @returns {string}
 */

async function read(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf-8", async (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

/**
 *
 * Write data to a file
 *
 * @param {string} filePath
 * @param {string} data
 * @returns {string}
 */

async function write(filePath, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(`Wrote File: ${filePath}`);
            }
        });
    });
}

module.exports = { read, write };
