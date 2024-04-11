const download = require("./download")

class Command {
    constructor() { }

    execute(...params) {
        console.log(params);
    }
}

class YTDownload extends Command {
    execute(window, dir, ...params) {
        // Logic already done in another project
        download.download(window, dir, ...params);
    }
}

module.exports = { YTDownload }