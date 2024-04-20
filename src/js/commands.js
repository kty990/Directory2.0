const download = require("./download")
const { exec } = require('child_process');
const { Coroutine } = require("./coroutine");

class YTDownload {
    static description = "Download a video from youtube.\n<i>Syntax: 'ytdown [URL]'</i>";
    static async execute(window, dir, ...params) {
        // Logic already done in another project
        console.log("attempting: ", params[0][0]);
        let result = await download.download(window, dir, params[0][0]);
        return result;
    }
}

class Test {
    static description = "A test command for development purposes.";
    static async execute(window, dir, ...params) {
        return [true];
    }
}

class TestError {
    static description = "A test command for development purposes.";
    static async execute(window, dir, ...params) {
        return [false, "test error"];
    }
}

class Exec {
    static description = "Executes a windows command. Any relavent output is displayed.\n<i>Syntax: exec [command + arguments]</i>";
    static async execute(window, dir, ...params) {
        return new Promise((resolve, reject) => {
            exec(params.join(" "), (error, stdout, stderr) => {
                if (error) {
                    resolve([false, error]);
                }
                resolve([true, stdout.toString() || `Successfully ran <span style="color:var(--active);">exec ${params.join(" ")}</span>`]);
            });
        })
    }
}

class NJSMake {
    static description = "Creates a coroutine for executing NodeJS code. Can be edited using njs-edit.\n<i>Syntax: 'njs-make [name] [code?]'</i>";
    static coroutines = {};
    static async execute(window, dir, ...params) {
        let name = params.splice(0, 1)[0];
        function createCallbackFromString(codeString) {
            try {
                const func = new Function('data', codeString);
                return func;
            } catch (error) {
                console.error("Error creating callback function:", error);
                return null;
            }
        }
        let func = createCallbackFromString(params.join(" "));
        if (!func) return [false, 'Error creating Coroutine function.'];
        let tmp = new Coroutine();
        this.coroutines[name] = tmp;
        return [true];
    }
}

class Help {
    static description = "Displays information regarding each command present in this terminal.";
    static async execute(window, dir, ...params) {
        let result = '';
        for (const [key, value] of Object.entries(commandDict)) {
            result += `<span style="font-weight: bold;">${key}</span><br><span style="padding-left: 10px;">Description: ${value.description.replace("\n", "<br>")}</span><br><br>`;
        }
        window.webContents.send("displayOutput", result);
        return [true];
    }
}

const commandDict = {
    'ytdown': YTDownload,
    'test': Test,
    'err': TestError,
    'exec': Exec,
    'njs-make': NJSMake,
    'help': Help
}


module.exports = { commandDict }