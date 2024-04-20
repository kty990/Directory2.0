const fs = require('fs');
const ytdl = require('ytdl-core');
const path = require('path');

function sanitizeFileName(fileName) {
    // Remove or replace characters that are not allowed in file names
    return fileName.replace(/[^\w.-]/g, '_'); // Replace non-word characters except for '.', '-' with '_'
}

async function download(window, dir, url) {
    return new Promise((resolve, reject) => {
        let currentDirectory = dir;
        if (!currentDirectory.endsWith("/")) {
            currentDirectory += "/"
        }
        ytdl.getInfo(url).then(async info => {

            // Log video information
            window.webContents.send("output_download", info.videoDetails);

            // ('Video Title:', info.videoDetails.title);
            // console.log('Video Author:', info.videoDetails.author.name);
            // console.log('Video Description:', info.videoDetails.description);

            let filePath = `${currentDirectory}${sanitizeFileName(info.videoDetails.title)}.mp4`;
            // Download video
            const fileStream = fs.createWriteStream(filePath);

            ytdl(url)
                .pipe(fileStream)
                .on('finish', () => {
                    console.log('Video downloaded successfully to ' + filePath + '!');
                    resolve([true]);
                    return;
                })
                .on('error', (err) => {
                    console.error('Error downloading video:', err);
                    resolve([false, err]);
                    return;
                });
        }).catch(e => {
            console.log(url, e);
            resolve([false, e]);
            return;
        });
    })
}

module.exports = { download };
