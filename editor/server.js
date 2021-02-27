const fs = require("fs");
const path = require("path");
const handler = require('serve-handler');
const http = require('http');

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

const PATH_MATCHES = [

];
 
const server = http.createServer((request, response) => {
    return handler(request, response, {
        "public": `${__dirname}/web`,
        "redirects": [
            { "source": "/asym", "destination": "../../node_modules/asym/src" },
            { "source": "/src", "destination": "../../src/" },
            { "source": "/images", "destination": "../../src/images/" },
            { "source": "/emcjs", "destination": MODULE_PATHS.emcJS },
            { "source": "/editors", "destination": MODULE_PATHS.trackerEditor },
        ]
    });
});

exports.startServer = function startServer() {
    return new Promise(resolve => {
        server.listen(4242, () => {
            resolve();
        });
    });
};
