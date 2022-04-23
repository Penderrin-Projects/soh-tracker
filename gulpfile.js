const fs = require("fs");
const path = require("path");
const gulp = require("gulp");
const htmlmin = require("gulp-htmlmin");
const jsonminify = require("gulp-jsonminify");
const svgo = require("gulp-svgo");
const newer = require("gulp-newer");
const autoprefixer = require("gulp-autoprefixer");
const indexManager = require("./build_tools/file-index.js");
const languageManager = require("./build_tools/language.js");

const SRC_PATH = path.resolve(__dirname, "./src");
const LOGIC_PATH = path.resolve(__dirname, "./logic");
const DEV_PATH = path.resolve(__dirname, "./dev");
const PRD_PATH = path.resolve(__dirname, "./prod");

const MODULE_PATHS = {
    emcJS: path.resolve(__dirname, "node_modules/emcjs/src"),
    trackerEditor: path.resolve(__dirname, "node_modules/jseditors/src"),
    RTCClient: path.resolve(__dirname, "node_modules/rtcclient/src")
};

function fileExists(filename) {
    try {
        fs.accessSync(filename);
        return true;
    } catch {
        return false;
    }
}

const NOLOCAL = process.argv.indexOf("-nolocal") >= 0;
const NOCOMPRESS = process.argv.indexOf("-nocompress") >= 0;
const REBUILD = process.argv.indexOf("-rebuild") >= 0;
const REBUILDJS = process.argv.indexOf("-rebuildjs") >= 0;

console.log({NOLOCAL, NOCOMPRESS, REBUILDJS, REBUILD});

if (!NOLOCAL) {
    const emcJS = path.resolve(__dirname, "../emcJS/src");
    if (fileExists(emcJS)) {
        MODULE_PATHS.emcJS = emcJS;
    }
    const trackerEditor = path.resolve(__dirname, "../JSEditors/src");
    if (fileExists(trackerEditor)) {
        MODULE_PATHS.trackerEditor = trackerEditor;
    }
    const RTCClient = path.resolve(__dirname, "../RTCClient/src");
    if (fileExists(RTCClient)) {
        MODULE_PATHS.RTCClient = RTCClient;
    }
}

/* JS START */
function copyJS(files, src, dest) {
    let res = gulp.src(files);
    res = res.pipe(indexManager.register(src, dest))
    if (!REBUILDJS && !REBUILD) {
        res = res.pipe(newer(dest))
    }
    res = res.pipe(gulp.dest(dest));
    return res;
}

function copyScript(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/script/**/*.js`
    ];
    const SRC = `${SRC_PATH}/script`;
    const DST = `${dest}/script`;
    return copyJS(FILES, SRC, DST);
}

function copyGameTrackerJS(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/GameTrackerJS/**/*.js`
    ];
    const SRC = `${SRC_PATH}/GameTrackerJS`;
    const DST = `${dest}/GameTrackerJS`;
    return copyJS(FILES, SRC, DST);
}

function copyEmcJS(dest = DEV_PATH) {
    const FILES = [
        `${MODULE_PATHS.emcJS}/**/*.js`,
        `!${MODULE_PATHS.emcJS}/*.js`
    ];
    const SRC = MODULE_PATHS.emcJS;
    const DST = `${dest}/emcJS`;
    return copyJS(FILES, SRC, DST);
}

function copyTrackerEditor(dest = DEV_PATH) {
    const FILES = [
        `${MODULE_PATHS.trackerEditor}/**/*.js`,
        `!${MODULE_PATHS.trackerEditor}/node_modules/**/*.js`,
        `!${MODULE_PATHS.trackerEditor}/*.js`,
        `${MODULE_PATHS.trackerEditor}/EditorChoice.js`
    ];
    const SRC = MODULE_PATHS.trackerEditor;
    const DST = `${dest}/editors`;
    return copyJS(FILES, SRC, DST);
}

function copyRTCClient(dest = DEV_PATH) {
    const FILES = [
        `${MODULE_PATHS.RTCClient}/**/*.js`
    ];
    const SRC = MODULE_PATHS.RTCClient;
    const DST = `${dest}/rtc`;
    return copyJS(FILES, SRC, DST);
}

function copyInitializer(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/sw.js`,
        `${SRC_PATH}/index.js`
    ];
    const SRC = SRC_PATH;
    const DST = dest;
    return copyJS(FILES, SRC, DST);
}

function copyDetachedScript(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/detached/**/*.js`
    ];
    const SRC = `${SRC_PATH}/detached`;
    const DST = `${dest}/detached`;
    return copyJS(FILES, SRC, DST);
}
/* JS END */

function copyHTML(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/**/*.html`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(indexManager.register(SRC_PATH, dest));
    if (!REBUILD) {
        res = res.pipe(newer(dest));
    }
    res = res.pipe(htmlmin({collapseWhitespace: true}));
    res = res.pipe(gulp.dest(dest));
    return res;
}

function copyJSON(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/**/*.json`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(indexManager.register(SRC_PATH, dest));
    if (!REBUILD) {
        res = res.pipe(newer(dest));
    }
    if (!NOCOMPRESS) {
        res = res.pipe(jsonminify());
    }
    res = res.pipe(gulp.dest(dest));
    return res;
}

function copyLogic(dest = DEV_PATH) {
    const FILES = [
        `${LOGIC_PATH}/**/*.min.json`
    ];
    const DST = `${dest}/logic`;
    let res = gulp.src(FILES);
    res = res.pipe(indexManager.register(SRC_PATH, DST));
    if (!REBUILD) {
        res = res.pipe(newer(DST));
    }
    res = res.pipe(gulp.dest(DST));
    return res;
}

function copyI18N(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/i18n/*.lang`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(indexManager.register(`${SRC_PATH}/i18n`, `${dest}/i18n`));
    res = res.pipe(languageManager.register(`${SRC_PATH}/i18n`, `${dest}/i18n`));
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/i18n`));
    }
    res = res.pipe(gulp.dest(`${dest}/i18n`));
    return res;
}

function copyImg(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/images/**/*.svg`,
        `${SRC_PATH}/images/**/*.png`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(indexManager.register(`${SRC_PATH}/images`, `${dest}/images`));
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/images`))
    }
    res = res.pipe(svgo())
    res = res.pipe(gulp.dest(`${dest}/images`));
    return res;
}

function copyChangelog(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/CHANGELOG.MD`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(indexManager.register(SRC_PATH, dest))
    if (!REBUILD) {
        res = res.pipe(newer(dest))
    }
    res = res.pipe(gulp.dest(dest));
    return res;
}

function copyCSS(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/style/**/*.css`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(indexManager.register(`${SRC_PATH}/style`, `${dest}/style`))
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/style`))
    }
    res = res.pipe(autoprefixer())
    res = res.pipe(gulp.dest(`${dest}/style`));
    return res;
}

function copyFonts(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/fonts/**/*.ttf`,
        `${SRC_PATH}/fonts/**/*.eot`,
        `${SRC_PATH}/fonts/**/*.otf`,
        `${SRC_PATH}/fonts/**/*.woff`,
        `${SRC_PATH}/fonts/**/*.woff2`,
        `${SRC_PATH}/fonts/**/*.svg`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(indexManager.register(`${SRC_PATH}/fonts`, `${dest}/fonts`))
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/fonts`))
    }
    res = res.pipe(gulp.dest(`${dest}/fonts`));
    return res;
}

function finish(dest, done) {
    indexManager.add(languageManager.finish(`${dest}/i18n`));
    indexManager.finish(dest);
    done();
}

exports.build = gulp.series(
    gulp.parallel(
        copyHTML.bind(this, PRD_PATH),
        copyJSON.bind(this, PRD_PATH),
        copyLogic.bind(this, PRD_PATH),
        copyI18N.bind(this, PRD_PATH),
        copyImg.bind(this, PRD_PATH),
        copyCSS.bind(this, PRD_PATH),
        copyFonts.bind(this, PRD_PATH),
        copyScript.bind(this, PRD_PATH),
        copyGameTrackerJS.bind(this, PRD_PATH),
        copyEmcJS.bind(this, PRD_PATH),
        copyTrackerEditor.bind(this, PRD_PATH),
        copyRTCClient.bind(this, PRD_PATH),
        copyInitializer.bind(this, PRD_PATH),
        copyDetachedScript.bind(this, PRD_PATH),
        copyChangelog.bind(this, PRD_PATH)
    ),
    finish.bind(this, PRD_PATH)
);

exports.buildDev = gulp.series(
    gulp.parallel(
        copyHTML.bind(this, DEV_PATH),
        copyJSON.bind(this, DEV_PATH),
        copyLogic.bind(this, DEV_PATH),
        copyI18N.bind(this, DEV_PATH),
        copyImg.bind(this, DEV_PATH),
        copyCSS.bind(this, DEV_PATH),
        copyFonts.bind(this, DEV_PATH),
        copyScript.bind(this, DEV_PATH),
        copyGameTrackerJS.bind(this, DEV_PATH),
        copyEmcJS.bind(this, DEV_PATH),
        copyTrackerEditor.bind(this, DEV_PATH),
        copyRTCClient.bind(this, DEV_PATH),
        copyInitializer.bind(this, DEV_PATH),
        copyDetachedScript.bind(this, DEV_PATH),
        copyChangelog.bind(this, DEV_PATH)
    ),
    finish.bind(this, DEV_PATH)
);

exports.watch = function() {
    exports.buildDev();
    return gulp.watch(
        SRC_PATH,
        exports.buildDev
    );
}
