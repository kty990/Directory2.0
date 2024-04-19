const fs = require('fs');
const ytdl = require('ytdl-core');
const path = require('path');

function sanitizeFileName(fileName) {
    // Remove or replace characters that are not allowed in file names
    return fileName.replace(/[^\w.-]/g, '_'); // Replace non-word characters except for '.', '-' with '_'
}

async function download(currentDirectory, url) {

    ytdl.getInfo(url).then(async info => {

        // Log video information
        console.log('Video Title:', info.videoDetails.title);
        console.log('Video Author:', info.videoDetails.author.name);
        console.log('Video Description:', info.videoDetails.description);

        let filePath = `${currentDirectory}_${info.videoDetails.title}`;
        if (!(filePath.toLowerCase().endsWith(".mp4") || filePath.toLowerCase().endsWith(".mp3"))) {
            filePath += ".mp4";
        }
        // Download video
        const fileStream = fs.createWriteStream(sanitizeFileName(filePath));

        ytdl(url)
            .pipe(fileStream)
            .on('finish', () => {
                console.log('Video downloaded successfully!');
                return true;
            })
            .on('error', (err) => {
                console.error('Error downloading video:', err);
                return [false, err];
            });
    }).catch(e => {
        console.log(url, e);
        return [false, e];
    });
}

module.exports = { download };
