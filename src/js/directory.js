const fs = require('fs');
const path = require('path');

function isShortcut(filePath) {
    try {
        const targetPath = fs.readFileSync(filePath, 'utf-8').trim();
        if (path.extname(filePath).toLowerCase() === '.lnk') return [true, targetPath];
        if (!fs.statSync(filePath).isFile()) return false;

        return [targetPath.startsWith('http://') || targetPath.startsWith('https://'), targetPath];
    } catch (e) {
        return [false, null];
    }
}


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
            let shortcut = isShortcut(dirPath);
            if (shortcut) {
                filesArray.push({ path: filePath, type: 'Shortcut', hidden: isHidden, size: stat.size, mod: stat.mtimeMs, targetPath: shortcut[1] });
            } else {
                const ext = path.extname(filePath).toUpperCase();
                if (ext) {
                    filesArray.push({ path: filePath, type: ext, hidden: isHidden, size: stat.size, mod: stat.mtimeMs });
                } else {
                    filesArray.push({ path: filePath, type: "File", hidden: isHidden, size: stat.size, mod: stat.mtimeMs });
                }

            }
        }
    });
    // console.log(filesArray);
    return filesArray;
}


module.exports = { getAllFiles };