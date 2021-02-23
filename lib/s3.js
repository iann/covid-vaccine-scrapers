const file = require("./file");
const AWS = require("aws-sdk");
const moment = require("moment");

/**
 *
 * @returns {AWS.s3}
 */

function init() {
    return new AWS.S3({
        accessKeyId: process.env.AWSACCESSKEYID,
        secretAccessKey: process.env.AWSSECRETACCESSKEY,
    });
}

/**
 *
 * @param {string} bucketPath
 * @param {string} fileName
 * @returns {object} s3.upload response data
 */

async function uploadFile(bucketPath, fileName) {
    const s3 = init();
    if (!bucketPath) {
        console.log("Missing bucketPath");
        return;
    }
    if (!fileName) {
        console.log("Missing fileName");
        return;
    }
    const s3Key = `${bucketPath}/${fileName}`;
    // s3.upload can read in the file but it might be useful at some point to have a global (file.read)
    const fileContents = await file.read(fileName);

    const params = {
        Bucket: process.env.AWSS3BUCKETNAME,
        Key: s3Key,
        Body: fileContents,
    };

    const uploadResponse = await new Promise((resolve, reject) => {
        s3.upload(params, function (err, data) {
            if (err) {
                reject(err);
            }
            console.log(`File uploaded successfully. ${data.Location}`);
            resolve(data);
        });
    });
    return uploadResponse;
}

/**
 *
 * We remove the colons for filesystem integrity
 * @returns {string}
 */

function getTimestampForFile() {
    return moment().format().replace(/:/g, "");
}

/**
 * @param {string} siteName eg. Lowell General
 * @param {object} page - puppeteer browser page
 * @returns {object} with htmlFileName , screenshotFileName
 */

async function savePageContent(siteName, page) {
    // It appears puppeteer does not have a generic page.waitForNetworkIdle
    // so for now we just assume all XHR requests will complete within
    // a reasonable timeframe, for now 10s.
    await page.waitForTimeout(10000);
    const html = await page.content();
    const timestamp = getTimestampForFile();
    const htmlFileName = `${siteName}-${timestamp}.html`;
    const screenshotFileName = `${siteName}-${timestamp}.png`;
    await page.screenshot({ path: screenshotFileName });
    await file.write(htmlFileName, html);
    const s3Dir = "debug";
    await uploadFile(s3Dir, htmlFileName);
    return { htmlFileName, screenshotFileName };
}

/**
 *
 * @param {string} webData
 * @returns {object} s3.upload response data
 */

async function saveWebData(webData) {
    const timestamp = getTimestampForFile();
    const webDataFileName1 = `data.json`;
    const webDataFileName2 = `data-${timestamp}.json`;
    await file.write(webDataFileName1, webData);
    await file.write(webDataFileName2, webData);
    const s3Dir = "/";
    const upload1 = await uploadFile(s3Dir, webDataFileName1);
    const upload2 = await uploadFile(s3Dir, webDataFileName2);
    return { upload1, upload2 };
}

module.exports = {
    init,
    uploadFile,
    getTimestampForFile,
    savePageContent,
    saveWebData,
};
