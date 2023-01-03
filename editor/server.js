const handler = require("serve-handler");
const http = require("http");

const MODULE_PATHS = {
    emcJS: "../node_modules/emcjs/src/",
    trackerEditor: "../node_modules/jseditors/src/",
    gameTrackerJS: "../node_modules/gametrackerjs/src/"
};

const server = http.createServer((request, response) => {
    console.log(request);
    return handler(request, response, {
        "public": `${__dirname}/web`,
        "rewrites": [
            {"source": "/src/:path", "destination": "../src/:path"},
            {"source": "/images/:path", "destination": "../dev/images/:path"},
            {"source": "/script/:path", "destination": "../dev/script/:path"},
            {"source": "/GameTrackerJS/:path", "destination": `${MODULE_PATHS.gameTrackerJS}/:path`},
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
