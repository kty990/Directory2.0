const { app, BrowserWindow, Menu, dialog, ipcMain, autoUpdater } = require('electron');
const path = require('path');
const fs = require('fs');
const directory = require('./directory');
const history = require("../../history.json");
const { commandDict } = require("./commands");
const os = require('os');

let devToolsOpened = false;

function addHistory(url) {
    if (history.steps[0] == url) { console.log('Returning from addHistory'); return; };
    history.steps.push(url);
    history.index++;
    fs.writeFile("../../history.json", JSON.stringify(history, null, 2), () => { });
}

class GraphicsWindow {
    constructor() {
        try {
            this.window = null;
            this.current_z_index = 0;
            this.layers = []; // List to store layers
            this.active_layer = null; // Currently active layer

            this.currentProject = null;

            app.on('ready', () => {
                this.createWindow();
            });
        } catch (e) {
            console.error(e);
        }
    }

    async createWindow() {
        this.window = new BrowserWindow({
            width: 1200,
            height: 600,
            // minWidth: 1200,   // Set the minimum width
            // minHeight: 600,  // Set the minimum height
            // maxHeight: 600,
            // maxWidth: 1200,
            resizable: false,
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                spellcheck: false,
                preload: path.join(__dirname, 'preload.js')
            },
        });

        // this.window.webContents.openDevTools();

        // Set the window icon
        const iconPath = path.join(__dirname, '../images/logo.png');
        this.window.setIcon(iconPath);

        const menu = Menu.buildFromTemplate([]);
        Menu.setApplicationMenu(menu);

        this.window.setMenu(menu);

        this.window.loadFile('./src/html/home.html'); // './src/html/home.html' = Production, '../html/home.html' = Development

        this.window.on('closed', () => {
            this.window = null;
        });

        // Only use for debugging
        // this.window.webContents.openDevTools({ reload: false })

    }
}

const graphicsWindow = new GraphicsWindow();

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


if (process.platform === 'win32') {
    app.setAppUserModelId('directory2');
}
/*
ipcMain.on("dev-refresh", () => {
    graphicsWindow.window.reload();
})
*/
ipcMain.on("close", () => {
    graphicsWindow.window.close();
})

ipcMain.on("minimize", () => {
    graphicsWindow.window.minimize();
})

ipcMain.on("toggle-dev-tools", () => {

    // Toggle the DevTools visibility based on its current state
    if (devToolsOpened) {
        graphicsWindow.window.webContents.closeDevTools();
    } else {
        graphicsWindow.window.webContents.openDevTools({ reload: false })
    }
})

ipcMain.on("getFiles", (ev, ...args) => {
    graphicsWindow.window.webContents.send("getFiles", directory.getAllFiles(args[0]));
})

ipcMain.on("load", () => {
    console.log(`Attempting to set url to ${process.cwd()}`);
    graphicsWindow.window.webContents.send("load", process.cwd());
    // history
    addHistory(process.cwd());
})

// --------------------------------------------------------------------------------------------------
// ==================================================================================================
// --------------------------------------------------------------------------------------------------

ipcMain.on("addHistory", (ev, data) => {
    console.log(`addHistory: ${data}`);
    addHistory(data);
})

ipcMain.on("backstep", (ev, data) => {
    console.log(`Backstep: ${history.steps.length > 1}, ${history.steps}\tData: ${data}`);
    if (history.index >= 1) {
        graphicsWindow.window.webContents.send("backstep", history.steps[--history.index]);
    }
    fs.writeFile("../../history.json", JSON.stringify(history, null, 2), () => { });
})

ipcMain.on("forward", (ev, data) => {
    console.log(`Forward: ${history.steps.length > history.index + 1}, ${history.steps}\tData: ${data}`);
    if (history.steps.length > history.index + 1) {
        graphicsWindow.window.webContents.send("forward", history.steps[++history.index]);
    }
    fs.writeFile("../../history.json", JSON.stringify(history, null, 2), () => { });
})


ipcMain.on("error", data => {
    console.log("Error occured:");
    console.log(data);
})

const cache = {};

ipcMain.on("edit-cache", (ev, data) => {
    const { key, value } = data;
    cache[key] = value;
})

ipcMain.on("get-cache", (ev, data) => {
    const { key } = data;
    graphicsWindow.window.webContents.send("get-cache", cache[key]);
})
ipcMain.on("runCommand", async (ev, data) => {
    let testIndex = Array.from(Object.keys(commandDict)).indexOf(data[0]);
    if (testIndex != -1) {
        //window, dir, ...params
        data.splice(0, 1);
        try {
            let result = await Array.from(Object.values(commandDict))[testIndex].execute(graphicsWindow.window, history.steps[history.index], data);
            console.log(result);
            graphicsWindow.window.webContents.send("runCommand", result);
        } catch (e) {
            graphicsWindow.window.webContents.send("runCommand", e);
        }

    } else {
        graphicsWindow.window.webContents.send("runCommand", [false, `Unable to find command ${data[0]}`]);
    }
})

ipcMain.on("getUser", () => {
    graphicsWindow.window.webContents.send("getUser", os.userInfo().username);
})



ipcMain.on("openFile", (ev, data) => {
    // filesArray.push({ path: filePath, type: 'Shortcut', hidden: isHidden, size: stat.size, mod: stat.mtimeMs });
    let file = data;
    console.log(data);
    if (file.type == "Shortcut") {
        commandDict['exec'].execute(null, history.steps[history.index], `start ${file.targetPath || file.path}`);
    }

})