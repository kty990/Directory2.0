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
        if (this.coroutines[name] != undefined) {
            return [false, `A Coroutine with the name [${name}] already exists!`];
        }
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
        let tmp = new Coroutine(func);
        this.coroutines[name] = tmp;
        return [true];
    }
}

class NJSDel {
    static description = "Deletes an existing coroutine created by <strong>njs-make</strong>. \n<i>Syntax: 'njs-del [name]'</i>";
    static async execute(window, dir, ...params) {
        let name = params.splice(0, 1)[0];
        if (NJSMake.coroutines[name] == undefined) {
            return [false, `No Coroutine with the name [${name}] exists!`];
        }
        NJSMake.coroutines[name].stop();
        NJSMake.coroutines[name] = undefined;
        return [true];
    }
}

class NJSEdit {
    static description = "Edits a coroutine for executing NodeJS code, created by <strong>njs-make</strong>.\n<i>Syntax: 'njs-edit [name] [code]'</i>";
    static coroutines = {};
    static async execute(window, dir, ...params) {
        let name = params.splice(0, 1)[0];
        if (this.coroutines[name] == undefined) {
            return [false, `No Coroutine with the name [${name}] exists!`];
        }
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
        if (!func) return [false, 'Error creating Coroutine function, edit.'];
        let tmp = new Coroutine(func);
        this.coroutines[name] = tmp;
        return [true, `Edited Coroutine "${name}"`];
    }
}

class NJSRun {
    static description = "Runs an existing coroutine created by <strong>njs-make</strong>. \n<i>Syntax: 'njs-run [name]'</i>";
    static async execute(window, dir, ...params) {
        let name = params.splice(0, 1)[0];
        if (NJSMake.coroutines[name] == undefined) {
            return [false, `No Coroutine with the name [${name}] exists!`];
        }
        NJSMake.coroutines[name].start();
        return [true, `Coroutine "${name}" is now running.`];
    }
}

class NJSStop {
    static description = "Runs an existing coroutine created by <strong>njs-make</strong>. \n<i>Syntax: 'njs-run [name]'</i>";
    static async execute(window, dir, ...params) {
        let name = params.splice(0, 1)[0];
        if (NJSMake.coroutines[name] == undefined) {
            return [false, `No Coroutine with the name [${name}] exists!`];
        }
        NJSMake.coroutines[name].stop();
        return [true, `Coroutine "${name}" stopped.`];
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

class Clear {
    static description = "Clears the terminal output.";
    static async execute(window, dir, ...params) {
        window.webContents.send("clearOutput");
        return [true];
    }
}

const commandDict = {
    'ytdown': YTDownload,
    'exec': Exec,
    'njs-make': NJSMake,
    'njs-del': NJSDel,
    'njs-edit': NJSEdit,
    'njs-run': NJSRun,
    'njs-stop': NJSStop,
    'help': Help,
    'cls': Clear
}


module.exports = { commandDict }