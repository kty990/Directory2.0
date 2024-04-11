const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath) {
    filesArray = [];
    const files = fs.readdirSync(dirPath);
    files.forEach(function (file) {
        const filePath = path.join(dirPath, file);
        const isHidden = /^\./.test(file); // Check if the file is hidden
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            filesArray.push({ path: filePath, type: 'Directory', hidden: isHidden, size: stat.size, mod: stat.mtimeMs });
        } else {
            filesArray.push({ path: filePath, type: 'File', hidden: isHidden, size: stat.size, mod: stat.mtimeMs });
        }
    });
    // console.log(filesArray);
    return filesArray;
}


module.exports = { getAllFiles };