const download = require("./download")

class YTDownload {
    static async execute(window, dir, ...params) {
        // Logic already done in another project
        console.log("attempting: ", params[0][0]);
        let result = await download.download(dir, params[0][0]);
        return result;
    }
}

class Test {
    static async execute(window, dir, ...params) {
        return [true];
    }
}

class TestError {
    static async execute(window, dir, ...params) {
        return [false, "test error"];
    }
}

const commandDict = {
    'ytdown': YTDownload,
    'test': Test,
    'err': TestError
}

module.exports = { commandDict }