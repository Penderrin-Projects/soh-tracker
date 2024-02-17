import {
    app, BrowserWindow
} from "electron";
import readline from "readline";
import WebService from "webservice/WebService.js";
import StaticService from "webservice/services/StaticService.js";

const service = new WebService();
const webServicePort = service.port;
service.registerService(StaticService, "", {serveFolder: "./editor/build"});

const OPTIONS = {debug: false};
if (process.argv.indexOf("-debug") >= 1) {
    OPTIONS.debug = true;
}

function createWindow() {
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
    win.loadURL(`http://localhost:${webServicePort}`);
    // win.loadFile("./build/index.html");
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

if (process.platform === "win32") {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on("SIGINT", function() {
        process.emit("SIGINT");
    });
}

process.on("SIGINT", function() {
    //graceful shutdown
    process.exit();
});
