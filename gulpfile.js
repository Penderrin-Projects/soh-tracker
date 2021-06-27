const fs = require("fs");
const path = require("path");
const gulp = require("gulp");
const htmlmin = require("gulp-htmlmin");
const jsonminify = require("gulp-jsonminify");
const svgo = require("gulp-svgo");
const newer = require("gulp-newer");
const autoprefixer = require("gulp-autoprefixer");
const filemanager = require("./file-manager.js");
const gulpAsyM = require("asym/GulpAsyM");
//const gulpAsyM = require("../AsyM/GulpAsyM.js");

const SRC_PATH = path.resolve(__dirname, "./src");
const DEV_PATH = path.resolve(__dirname, "./dev");
const PRD_PATH = path.resolve(__dirname, "./prod");

const MODULE_PATHS = {
    emcJS: path.resolve(__dirname, "node_modules/emcjs/src"),
    trackerEditor: path.resolve(__dirname, "node_modules/jseditors/src"),
    RTCClient: path.resolve(__dirname, "node_modules/rtcclient/src"),
    AsyM: path.resolve(__dirname, "node_modules/asym/src"),
};

function fileExists(filename) {
    try {
        fs.accessSync(filename);
        return true;
    } catch (e) {
        return false;
    }
}

const NOLOCAL = process.argv.indexOf('-nolocal') >= 0;
const NOCOMPRESS = process.argv.indexOf('-nocompress') >= 0;
const REBUILD = process.argv.indexOf('-rebuild') >= 0;
const TLA = process.argv.indexOf('-tla') >= 0;

console.log({
    NOLOCAL, NOCOMPRESS, REBUILD, TLA
});

if (!NOLOCAL) {
    let emcJS = path.resolve(__dirname, '../emcJS/src');
    if (fileExists(emcJS)) {
        MODULE_PATHS.emcJS = emcJS;
    }
    let trackerEditor = path.resolve(__dirname, '../JSEditors/src');
    if (fileExists(trackerEditor)) {
        MODULE_PATHS.trackerEditor = trackerEditor;
    }
    let RTCClient = path.resolve(__dirname, '../RTCClient/src');
    if (fileExists(RTCClient)) {
        MODULE_PATHS.RTCClient = RTCClient;
    }
    let asyM = path.resolve(__dirname, '../AsyM/src');
    if (fileExists(asyM)) {
        MODULE_PATHS.AsyM = asyM;
    }
}

function copyAsyM(dest = DEV_PATH) {
    let res = gulp.src(`${MODULE_PATHS.AsyM}/**/*.js`);
    res = res.pipe(filemanager.register(MODULE_PATHS.AsyM, `${dest}/asym`))
    res = res.pipe(newer(`${dest}/asym`))
    res = res.pipe(gulp.dest(`${dest}/asym`));
    return res;
}

function copyHTML(dest = DEV_PATH) {
    let res = gulp.src(`${SRC_PATH}/**/*.html`);
    res = res.pipe(filemanager.register(SRC_PATH, dest));
    res = res.pipe(newer(dest));
    res = res.pipe(htmlmin({ collapseWhitespace: true }));
    res = res.pipe(gulp.dest(dest));
    return res;
}

function copyJSON(dest = DEV_PATH) {
    let res = gulp.src(`${SRC_PATH}/**/*.json`)
    res = res.pipe(filemanager.register(SRC_PATH, dest));
    if (!REBUILD) {
        res = res.pipe(newer(dest));
    }
    if (!NOCOMPRESS) {
        res = res.pipe(jsonminify());
    }
    res = res.pipe(gulp.dest(dest));
    return res;
}

function copyI18N(dest = DEV_PATH) {
    let res = gulp.src(`${SRC_PATH}/i18n/*.lang`)
    res = res.pipe(filemanager.register(`${SRC_PATH}/i18n`, `${dest}/i18n`))
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
    let res = gulp.src(FILES)
    res = res.pipe(filemanager.register(`${SRC_PATH}/images`, `${dest}/images`))
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/images`))
    }
    res = res.pipe(svgo())
    res = res.pipe(gulp.dest(`${dest}/images`));
    return res;
}

function copyChangelog(dest = DEV_PATH) {
    let res = gulp.src(`${SRC_PATH}/CHANGELOG.MD`)
    res = res.pipe(filemanager.register(SRC_PATH, dest))
    if (!REBUILD) {
        res = res.pipe(newer(dest))
    }
    res = res.pipe(gulp.dest(dest));
    return res;
}

function copyCSS(dest = DEV_PATH) {
    let res = gulp.src(`${SRC_PATH}/style/**/*.css`)
    res = res.pipe(filemanager.register(`${SRC_PATH}/style`, `${dest}/style`))
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
    let res = gulp.src(FILES)
    res = res.pipe(filemanager.register(`${SRC_PATH}/fonts`, `${dest}/fonts`))
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/fonts`))
    }
    res = res.pipe(gulp.dest(`${dest}/fonts`));
    return res;
}

function copyScript(dest = DEV_PATH) {
    let res = gulp.src(`${SRC_PATH}/script/**/*.js`)
    res = res.pipe(filemanager.register(`${SRC_PATH}/script`, `${dest}/script`))
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/script`))
    }
    if (!TLA) {
        res = res.pipe(gulpAsyM({
            path: "/asym",
            alike: /Import\.module/
        }))
    }
    res = res.pipe(gulp.dest(`${dest}/script`));
    return res;
}

function copyGameTrackerJS(dest = DEV_PATH) {
    let res = gulp.src(`${SRC_PATH}/GameTrackerJS/**/*.js`)
    res = res.pipe(filemanager.register(`${SRC_PATH}/GameTrackerJS`, `${dest}/GameTrackerJS`))
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/GameTrackerJS`))
    }
    if (!TLA) {
        res = res.pipe(gulpAsyM({
            path: "/asym",
            alike: /Import\.module/
        }))
    }
    res = res.pipe(gulp.dest(`${dest}/GameTrackerJS`));
    return res;
}

function copyEmcJS(dest = DEV_PATH) {
    const FILES = [
        `${MODULE_PATHS.emcJS}/**/*.js`,
        `!${MODULE_PATHS.emcJS}/*.js`
    ];
    let res = gulp.src(FILES)
    res = res.pipe(filemanager.register(MODULE_PATHS.emcJS, `${dest}/emcJS`))
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/emcJS`))
    }
    res = res.pipe(gulp.dest(`${dest}/emcJS`));
    return res;
}

function copyTrackerEditor(dest = DEV_PATH) {
    const FILES = [
        `${MODULE_PATHS.trackerEditor}/**/*.js`,
        `!${MODULE_PATHS.trackerEditor}/node_modules/**/*.js`,
        `!${MODULE_PATHS.trackerEditor}/*.js`,
        `${MODULE_PATHS.trackerEditor}/EditorChoice.js`
    ];
    let res = gulp.src(FILES)
    res = res.pipe(filemanager.register(MODULE_PATHS.trackerEditor, `${dest}/editors`))
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/editors`))
    }
    res = res.pipe(gulp.dest(`${dest}/editors`));
    return res;
}

function copyRTCClient(dest = DEV_PATH) {
    let res = gulp.src(`${MODULE_PATHS.RTCClient}/**/*.js`)
    res = res.pipe(filemanager.register(MODULE_PATHS.RTCClient, `${dest}/rtc`))
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/rtc`))
    }
    res = res.pipe(gulp.dest(`${dest}/rtc`));
    return res;
}

function copyInitializer(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/sw.js`,
        `${SRC_PATH}/index.js`
    ];
    let res = gulp.src(FILES)
    res = res.pipe(filemanager.register(SRC_PATH, dest))
    if (!REBUILD) {
        res = res.pipe(newer(dest))
    }
    res = res.pipe(gulp.dest(dest));
    return res;
}

function copyDetachedScript(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/detached/index.js`
    ];
    let res = gulp.src(FILES)
    res = res.pipe(filemanager.register(SRC_PATH, dest))
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/detached`))
    }
    if (!TLA) {
        res = res.pipe(gulpAsyM({
            path: "/asym",
            alike: /Import\.module/
        }))
    }
    res = res.pipe(gulp.dest(`${dest}/detached`));
    return res;
}

function finish(dest = DEV_PATH, done) {
    filemanager.finish(dest);
    done();
}

exports.build = gulp.series(
    gulp.parallel(
        copyAsyM.bind(this, PRD_PATH),
        copyHTML.bind(this, PRD_PATH),
        copyJSON.bind(this, PRD_PATH),
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
        copyAsyM.bind(this, DEV_PATH),
        copyHTML.bind(this, DEV_PATH),
        copyJSON.bind(this, DEV_PATH),
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

exports.watch = function () {
    return gulp.watch(
        `${SRC_PATH}/**/*`,
        build
    );
}
