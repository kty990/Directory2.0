const { app, BrowserWindow, Menu, dialog, ipcMain, autoUpdater } = require('electron');
const path = require('path');
const fs = require('fs');
const directory = require('./directory');
const history = require("../../history.json");

let devToolsOpened = false;

function addHistory(url) {
    if (history.steps[0] == url) { console.log('Returning from addHistory'); return; };
    history.steps.push(url);
    history.index++;
    fs.writeFile("../../history.json", JSON.stringify(history, null, 2), () => { });
}

class Coroutine {
    constructor(callback) {
        this.callback = callback;
        this.onError = (error) => console.error(`Coroutine Error: ${error}`);
        this.isRunning = false;
        this.generator = null;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.generator = this.callback(); // Recreate the generator
            this.resume();
            // console.log(`Coroutine started!`);
        }
    }

    stop() {
        this.isRunning = false;
        // console.log(`Coroutine stopped!`);
    }

    resume() {
        if (!this.isRunning) return;

        try {
            const { value, done } = this.generator.next();

            if (!done) {
                // Schedule the next iteration of the generator
                setTimeout(() => this.resume(), 0);
            }
        } catch (error) {
            // Handle errors using the onError function
            this.onError(`Error: ${error}`);
            this.stop(); // Stop the coroutine on error
        }
    }
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

        this.window.loadFile('../html/home.html');

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

ipcMain.on("dev-refresh", () => {
    graphicsWindow.window.reload();
})

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

console.log("Opening");