const {app, protocol, BrowserWindow} = require("electron");
const path = require("path");
// const {startServer} = require("./server.js");

const __dirnameUnix = __dirname.replace(/\\/g, "/");

const OPTIONS = {debug: false};
if (process.argv.indexOf("-debug") >= 1) {
    OPTIONS.debug = true;
}

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
        url = url.replace(/^\/?logic\//i, "../logic/");
        url = url.replace(/^\/?database\//i, "./build/database/");
        url = url.replace(/^\/?images\//i, "./build/images/");
        url = url.replace(/^\/?script\//i, "./build/script/");
        url = url.replace(/^\/?GameTrackerJS\//i, "./build/GameTrackerJS/");
        url = url.replace(/^\/?emcJS\//i, "./build/emcJS/");
        url = url.replace(/^\/?editors\//i, "./build/editors/");
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
            nativeWindowOpen: true,
            contextIsolation: true,
            nodeIntegration: false,
            nodeIntegrationInWorker: false
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
