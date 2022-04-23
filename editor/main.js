const {app, protocol, BrowserWindow} = require("electron");
const fs = require("fs");
const path = require("path");
// const {startServer} = require("./server.js");

const __dirnameUnix = __dirname.replace(/\\/g, "/");

const OPTIONS = {debug: false};
if (process.argv.indexOf("-debug") >= 1) {
    OPTIONS.debug = true;
}

const MODULE_PATHS = {
    emcJS: "../node_modules/emcjs/src/",
    trackerEditor: "../node_modules/jseditors/src/"
};

function fileExists(filename) {
    try {
        fs.accessSync(filename);
        return true;
    } catch {
        return false;
    }
}

if (process.argv.indexOf("-nolocal") < 0) {
    const emcJS = path.resolve(__dirname, "../../emcJS/src");
    if (fileExists(emcJS)) {
        MODULE_PATHS.emcJS = "../../emcJS/src/";
    }
    const trackerEditor = path.resolve(__dirname, "../../JSEditors/src");
    if (fileExists(trackerEditor)) {
        MODULE_PATHS.trackerEditor = "../../JSEditors/src/";
    }
}

console.log(MODULE_PATHS);

function createWindow() {
    protocol.interceptFileProtocol("file", (request, callback) => {
        console.log("-------------------");
        let url = request.url.replace(/file:\/+/i, "");
        console.log(url);
        if (!url.startsWith(__dirnameUnix)) {
            url = url.replace(/(:?[a-z]:)?/i, "");
        }
        console.log(url);
        url = url.replace(__dirnameUnix, "");
        console.log(url);
        /* redirects */
        url = url.replace(/^\/?src\//i, "../src/");
        url = url.replace(/^\/?database\//i, "../src/database/");
        url = url.replace(/^\/?images\//i, "../src/images/");
        url = url.replace(/^\/?script\//i, "../src/script/");
        url = url.replace(/^\/?GameTrackerJS\//i, "../src/GameTrackerJS/");
        url = url.replace(/^\/?emcjs\//i, MODULE_PATHS.emcJS);
        url = url.replace(/^\/?editors\//i, MODULE_PATHS.trackerEditor);
        url = path.join(__dirnameUnix, ".", url);
        url = path.normalize(url);
        console.log(url);
        callback({path: url});
    });

    const win = new BrowserWindow({
        width: 800,
        height: 700,
        show: false,
        webPreferences: {
            nativeWindowOpen: true
            //nodeIntegration: true
            //preload: `${__dirname}/../webutils/_preload.js`
        }
        //icon: __dirname + "/icon.png"
    });
    win.maximize();
    win.setMenu(null);
    //win.loadURL("http://localhost:4242");
    win.loadFile("./web/index.html");
    if (OPTIONS.debug) {
        win.toggleDevTools();
    }
    win.once("ready-to-show", () => {
        win.show();
    });
    win.on("closed", () => {
        app.quit();
    });
}

app.on("ready", async () => {
    //await startServer();
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
