const fs = require("fs");
const path = require("path");
const handler = require("serve-handler");
const http = require("http");

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

// const PATH_MATCHES = [

// ];

const server = http.createServer((request, response) => {
    console.log(request);
    return handler(request, response, {
        "public": `${__dirname}/web`,
        "rewrites": [
            {"source": "/src/:path", "destination": "../src/:path"},
            {"source": "/images/:path", "destination": "../src/images/:path"},
            {"source": "/script/:path", "destination": "../src/script/:path"},
            {"source": "/GameTrackerJS/:path", "destination": "../src/GameTrackerJS/:path"},
            {"source": "/emcjs/:path", "destination": `${MODULE_PATHS.emcJS}/:path`},
            {"source": "/editors/:path", "destination": `${MODULE_PATHS.trackerEditor}/:path`}
        ]
    });
});

exports.startServer = function startServer() {
    return new Promise((resolve) => {
        server.listen(4242, () => {
            resolve();
        });
    });
};
