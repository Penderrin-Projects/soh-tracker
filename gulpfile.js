import path from "path";
import gulp from "gulp";
import htmlmin from "gulp-htmlmin";
import jsonminify from "gulp-jsonminify";
import svgo from "gulp-svgo";
import newer from "gulp-newer";
import autoprefixer from "gulp-autoprefixer";
import FileIndex from "emcjs/build_tools/FileIndex.js";
import LanguageManager from "emcjs/build_tools/LanguageManager.js";
import sourceImport from "emcjs/build_tools/sourceImport.js";
import ImportAnalyzer from "emcjs/build_tools/ImportAnalyzer.js";

const __dirname = path.resolve();

const NODE_FOLDER = path.resolve(__dirname, "node_modules");

const SRC_PATH = path.resolve(__dirname, "src");
const LOGIC_PATH = path.resolve(__dirname, "logic");
const DEV_PATH = path.resolve(__dirname, "dev");
const PRD_PATH = path.resolve(__dirname, "prod");
const EDT_PATH = path.resolve(__dirname, "editor/build");

const MODULE_PATHS = {
    emcJS: path.resolve(NODE_FOLDER, "emcjs/src"),
    GameTrackerJS: path.resolve(NODE_FOLDER, "gametrackerjs/src"),
    JSEditors: path.resolve(NODE_FOLDER, "jseditors/src"),
    RTCClient: path.resolve(NODE_FOLDER, "rtcclient/src")
};

const NOCOMPRESS = process.argv.indexOf("-nocompress") >= 0;
const REBUILD = process.argv.indexOf("-rebuild") >= 0;
const REBUILDJS = process.argv.indexOf("-rebuildjs") >= 0;

console.log({NOCOMPRESS, REBUILDJS, REBUILD});

/* JS START */
function copyJS(files, src, dest, target) {
    let res = gulp.src(files);
    res = res.pipe(FileIndex.register(src, dest))
    res = res.pipe(ImportAnalyzer.register(src, dest, target));
    if (!REBUILDJS && !REBUILD) {
        res = res.pipe(newer(dest))
    }
    res = res.pipe(sourceImport());
    res = res.pipe(gulp.dest(dest));
    return res;
}

function copyScript(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/script/**/*.js`
    ];
    const SRC = `${SRC_PATH}/script`;
    const DST = `${dest}/script`;
    return copyJS(FILES, SRC, DST, dest);
}

function copyGameTrackerJS(dest = DEV_PATH) {
    const FILES = [
        `${MODULE_PATHS.GameTrackerJS}/**/*.js`,
        `!${MODULE_PATHS.GameTrackerJS}/*.js`
    ];
    const SRC = MODULE_PATHS.GameTrackerJS;
    const DST = `${dest}/GameTrackerJS`;
    return copyJS(FILES, SRC, DST, dest);
}

function copyEmcJS(dest = DEV_PATH) {
    const FILES = [
        `${MODULE_PATHS.emcJS}/**/*.js`,
        `!${MODULE_PATHS.emcJS}/*.js`
    ];
    const SRC = MODULE_PATHS.emcJS;
    const DST = `${dest}/emcJS`;
    return copyJS(FILES, SRC, DST, dest);
}

function copyTrackerEditor(dest = DEV_PATH) {
    const FILES = [
        `${MODULE_PATHS.JSEditors}/**/*.js`,
        `!${MODULE_PATHS.JSEditors}/node_modules/**/*.js`
    ];
    const SRC = MODULE_PATHS.JSEditors;
    const DST = `${dest}/editors`;
    return copyJS(FILES, SRC, DST, dest);
}

function copyRTCClient(dest = DEV_PATH) {
    const FILES = [
        `${MODULE_PATHS.RTCClient}/**/*.js`
    ];
    const SRC = MODULE_PATHS.RTCClient;
    const DST = `${dest}/rtc`;
    return copyJS(FILES, SRC, DST, dest);
}

function copyInitializer(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/sw.js`,
        `${SRC_PATH}/index.js`
    ];
    const SRC = SRC_PATH;
    const DST = dest;
    return copyJS(FILES, SRC, DST, dest);
}

function copyDetachedScript(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/detached/**/*.js`
    ];
    const SRC = `${SRC_PATH}/detached`;
    const DST = `${dest}/detached`;
    return copyJS(FILES, SRC, DST, dest);
}
/* JS END */

function copyHTML(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/**/*.html`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(SRC_PATH, dest));
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
    res = res.pipe(FileIndex.register(SRC_PATH, dest));
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
    res = res.pipe(FileIndex.register(SRC_PATH, DST));
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
    res = res.pipe(FileIndex.register(`${SRC_PATH}/i18n`, `${dest}/i18n`));
    res = res.pipe(LanguageManager.register(`${SRC_PATH}/i18n`, `${dest}/i18n`));
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/i18n`));
    }
    res = res.pipe(gulp.dest(`${dest}/i18n`));
    return res;
}

function copyI18NFragments(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/i18n/fragments/**/*.js`,
        `${SRC_PATH}/i18n/fragments/**/*.json`,
        `${SRC_PATH}/i18n/fragments/**/*.lang`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${SRC_PATH}/i18n/fragments`, `${dest}/i18n/fragments`));
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/i18n/fragments`));
    }
    res = res.pipe(gulp.dest(`${dest}/i18n/fragments`));
    return res;
}

function copyImg(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/images/**/*.svg`,
        `${SRC_PATH}/images/**/*.png`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${SRC_PATH}/images`, `${dest}/images`));
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
    res = res.pipe(FileIndex.register(SRC_PATH, dest))
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
    res = res.pipe(FileIndex.register(`${SRC_PATH}/style`, `${dest}/style`))
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
    res = res.pipe(FileIndex.register(`${SRC_PATH}/fonts`, `${dest}/fonts`))
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/fonts`))
    }
    res = res.pipe(gulp.dest(`${dest}/fonts`));
    return res;
}

function finish(dest, deleteUnused, done) {
    FileIndex.add(LanguageManager.finish(`${dest}/i18n`));
    const config = {
        usedImports: ImportAnalyzer.getUsedImports(
            dest,
            path.resolve(dest, "script/app.js"),
            path.resolve(dest, "sw.js"),
            path.resolve(dest, "index.js"),
            path.resolve(dest, "script/StateRecovery.js"),
            path.resolve(dest, "detached/index.js")
        ),
        ignoreImportPaths: /.*\/(i18n\/fragments\/.*|emcJS\/polyfills\/.*|worker\/.*|StateConverter[0-9]+)\.js/,
        deleteUnused: deleteUnused
    };
    FileIndex.finish(dest, undefined, config);
    done();
}

export const build = gulp.series(
    gulp.parallel(
        copyHTML.bind(this, PRD_PATH),
        copyJSON.bind(this, PRD_PATH),
        copyLogic.bind(this, PRD_PATH),
        copyI18N.bind(this, PRD_PATH),
        copyI18NFragments.bind(this, PRD_PATH),
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
    finish.bind(this, PRD_PATH, true)
);

export const buildDev = gulp.series(
    gulp.parallel(
        copyHTML.bind(this, DEV_PATH),
        copyJSON.bind(this, DEV_PATH),
        copyLogic.bind(this, DEV_PATH),
        copyI18N.bind(this, DEV_PATH),
        copyI18NFragments.bind(this, DEV_PATH),
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
    finish.bind(this, DEV_PATH, true)
);

export const buildEditor = gulp.series(
    gulp.parallel(
        copyHTML.bind(this, EDT_PATH),
        copyJSON.bind(this, EDT_PATH),
        copyLogic.bind(this, EDT_PATH),
        copyScript.bind(this, EDT_PATH),
        copyI18N.bind(this, EDT_PATH),
        copyI18NFragments.bind(this, EDT_PATH),
        copyGameTrackerJS.bind(this, EDT_PATH),
        copyEmcJS.bind(this, EDT_PATH),
        copyTrackerEditor.bind(this, EDT_PATH),
        copyInitializer.bind(this, EDT_PATH)
    ),
    finish.bind(this, EDT_PATH, false)
);

export const watch = function() {
    exports.buildDev();
    return gulp.watch(
        SRC_PATH,
        exports.buildDev
    );
}
