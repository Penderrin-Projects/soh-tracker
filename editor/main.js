const { app, protocol, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");
//const { augmentFile } = require("AsyM/Augmentor");
const { augmentFile } = require("../../AsyM/Augmentor.js");
const { startServer } = require("./server.js");

const __dirnameUnix = __dirname.replace(/\\/g, "/");

let OPTIONS = {
    debug: false
};
if (process.argv.indexOf('-debug') >= 1) {
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
    } catch (e) {
        return false;
    }
}

if (process.argv.indexOf('-nolocal') < 0) {
    let emcJS = path.resolve(__dirname, '../../emcJS/src');
    if (fileExists(emcJS)) {
        MODULE_PATHS.emcJS = '../../emcJS/src/';
    }
    let trackerEditor = path.resolve(__dirname, '../../JSEditors/src');
    if (fileExists(trackerEditor)) {
        MODULE_PATHS.trackerEditor = '../../JSEditors/src/';
    }
}

console.log(MODULE_PATHS);

function createWindow() {
    protocol.interceptFileProtocol("file", (request, callback) => {
        console.log("-------------------");
        let url = request.url.replace(/file\:\/+/i, "");
        console.log(url);
        if (!url.startsWith(__dirnameUnix)) {
            url = url.replace(/(:?[a-z]\:)?/i, "");
        }
        console.log(url);
        url = url.replace(__dirnameUnix, "");
        console.log(url);
        if (url.startsWith("/script/") || url.startsWith("/GameTrackerJS/")) {
            url = path.join(__dirnameUnix, ".", `../src${url}`);
            console.log(url);
            const content = fs.readFileSync(url);
            const data = augmentFile(content.toString(), {path: "/asym"});
            callback({
                data,
                statusCode: 200,
                mimeType: "text/javascript"
            });
        } else {
            url = url.replace(/^\/?asym\//i, "../node_modules/asym/src/");
            url = url.replace(/^\/?src\//i, "../src/");
            url = url.replace(/^\/?images\//i, "../src/images/");
            // url = url.replace(/^\/?script\//i, "../src/script/");
            // url = url.replace(/^\/?GameTrackerJS\//i, "../src/GameTrackerJS/");
            url = url.replace(/^\/?emcjs\//i, MODULE_PATHS.emcJS);
            url = url.replace(/^\/?editors\//i, MODULE_PATHS.trackerEditor);
            url = path.join(__dirnameUnix, ".", url);
            url = path.normalize(url);
            console.log(url);
            callback({path: url});
        }
    });

    let win = new BrowserWindow({
        width: 800,
        height: 700,
        show: false,
        webPreferences: {
            nativeWindowOpen: true,
            //nodeIntegration: true
            //preload: `${__dirname}/../webutils/_preload.js`
        }
        //icon: __dirname + "/icon.png"
    });
    win.maximize();
    win.setMenu(null);
    win.loadURL("http://localhost:4242");
    if (!!OPTIONS.debug) {
        win.toggleDevTools();
    }
    win.once('ready-to-show', () => {
        win.show();
    });
    win.on('closed', () => {
        app.quit();
    });
}



app.on('ready', async () => {
    await startServer();
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});