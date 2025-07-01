import path from "path";
import gulp from "gulp";
import htmlmin from "gulp-htmlmin";
import jsonminify from "gulp-jsonminify";
import svgo from "gulp-svgo";
import newer from "gulp-newer";
import autoprefixer from "gulp-autoprefixer";
import FileIndex from "emcjs/_build_tools/FileIndex.js";
import LanguageManager from "emcjs/_build_tools/LanguageManager.js";
import sourceImport from "emcjs/_build_tools/sourceImport.js";
import ImportAnalyzer from "emcjs/_build_tools/ImportAnalyzer.js";

const __dirname = path.resolve();

const NODE_FOLDER = path.resolve(__dirname, "node_modules");

const SRC_PATH = path.resolve(__dirname, "src");
const LOGIC_PATH = path.resolve(__dirname, "logic");
const DEV_PATH = path.resolve(__dirname, "dev");
const PRD_PATH = path.resolve(__dirname, "prod");

const MODULE_PATHS = {
    emcJS: path.resolve(NODE_FOLDER, "emcjs/src"),
    GameTrackerJS: path.resolve(NODE_FOLDER, "gametrackerjs/src"),
    JSEditors: path.resolve(NODE_FOLDER, "jseditors/src"),
    RTCClient: path.resolve(NODE_FOLDER, "rtcclient/src"),
    ArchipelagoJS: path.resolve(NODE_FOLDER, "archipelagojs/src")
};

/* configuration */
const DELETE_UNUSED_FILES = true;
const NOCOMPRESS = process.argv.indexOf("-nocompress") >= 0;
const REBUILD = process.argv.indexOf("-rebuild") >= 0;
const REBUILDJS = process.argv.indexOf("-rebuildjs") >= 0;

console.log({NOCOMPRESS, REBUILDJS, REBUILD});

// ImportAnalyzer.reportImport(true);

/* JS START */
function copyJS(files, src, dest, target) {
    let res = gulp.src(files);
    res = res.pipe(FileIndex.register(src, dest));
    res = res.pipe(ImportAnalyzer.register(src, dest, target));
    if (!REBUILDJS && !REBUILD) {
        res = res.pipe(newer(dest));
    }
    res = res.pipe(sourceImport());
    res = res.pipe(gulp.dest(dest));
    return res;
}

function copyScript(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${src}/script/**/*.js`
    ];
    const SRC = `${src}/script`;
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

function copyJSEditors(dest = DEV_PATH) {
    const FILES = [
        `${MODULE_PATHS.JSEditors}/**/*.js`,
        `!${MODULE_PATHS.JSEditors}/node_modules/**/*.js`
    ];
    const SRC = MODULE_PATHS.JSEditors;
    const DST = `${dest}/JSEditors`;
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

function copyArchipelagoJS(dest = DEV_PATH) {
    const FILES = [
        `${MODULE_PATHS.ArchipelagoJS}/**/*.js`
    ];
    const SRC = MODULE_PATHS.ArchipelagoJS;
    const DST = `${dest}/ArchipelagoJS`;
    return copyJS(FILES, SRC, DST, dest);
}

function copyInitializer(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${src}/sw.js`,
        `${src}/index.js`
    ];
    const SRC = src;
    const DST = dest;
    return copyJS(FILES, SRC, DST, dest);
}

function copyDetachedScript(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${src}/detached/**/*.js`
    ];
    const SRC = `${src}/detached`;
    const DST = `${dest}/detached`;
    return copyJS(FILES, SRC, DST, dest);
}
/* JS END */

function copyHTML(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${src}/**/*.html`,
        `!${src}/script/**/*.html`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(src, dest));
    if (!REBUILD) {
        res = res.pipe(newer(dest));
    }
    res = res.pipe(htmlmin({collapseWhitespace: true}));
    res = res.pipe(gulp.dest(dest));
    return res;
}

function copyJSON(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${src}/**/*.json`,
        `!${src}/script/**/*.json`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(src, dest));
    if (!REBUILD) {
        res = res.pipe(newer(dest));
    }
    if (!NOCOMPRESS) {
        res = res.pipe(jsonminify());
    }
    res = res.pipe(gulp.dest(dest));
    return res;
}

function copyLogic(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${LOGIC_PATH}/**/*.min.json`
    ];
    const DST = `${dest}/logic`;
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(src, DST));
    if (!REBUILD) {
        res = res.pipe(newer(DST));
    }
    res = res.pipe(gulp.dest(DST));
    return res;
}

function copyI18N(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${src}/i18n/*.lang`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${src}/i18n`, `${dest}/i18n`));
    res = res.pipe(LanguageManager.register(`${src}/i18n`, `${dest}/i18n`));
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/i18n`));
    }
    res = res.pipe(gulp.dest(`${dest}/i18n`));
    return res;
}

function copyI18NFragments(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${src}/i18n/fragments/**/*.js`,
        `${src}/i18n/fragments/**/*.json`,
        `${src}/i18n/fragments/**/*.lang`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${src}/i18n/fragments`, `${dest}/i18n/fragments`));
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/i18n/fragments`));
    }
    res = res.pipe(gulp.dest(`${dest}/i18n/fragments`));
    return res;
}

function copyImg(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${src}/images/**/*.svg`,
        `${src}/images/**/*.png`,
        `${src}/images/**/*.webp`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${src}/images`, `${dest}/images`));
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/images`));
    }
    res = res.pipe(svgo());
    res = res.pipe(gulp.dest(`${dest}/images`));
    return res;
}

function copyChangelog(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${src}/CHANGELOG.MD`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(src, dest));
    if (!REBUILD) {
        res = res.pipe(newer(dest));
    }
    res = res.pipe(gulp.dest(dest));
    return res;
}

function copyCSS(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${src}/style/**/*.css`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${src}/style`, `${dest}/style`));
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/style`));
    }
    res = res.pipe(autoprefixer());
    res = res.pipe(gulp.dest(`${dest}/style`));
    return res;
}

function copyEmcJSCSS(dest = DEV_PATH) {
    const FILES = [
        `${MODULE_PATHS.emcJS}/_style/*.css`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${MODULE_PATHS.emcJS}/_style`, `${dest}/emcJS/_style`));
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/emcJS/_style`));
    }
    res = res.pipe(autoprefixer());
    res = res.pipe(gulp.dest(`${dest}/emcJS/_style`));
    return res;
}

function copyFonts(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${src}/fonts/**/*.ttf`,
        `${src}/fonts/**/*.eot`,
        `${src}/fonts/**/*.otf`,
        `${src}/fonts/**/*.woff`,
        `${src}/fonts/**/*.woff2`,
        `${src}/fonts/**/*.svg`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${src}/fonts`, `${dest}/fonts`));
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/fonts`));
    }
    res = res.pipe(gulp.dest(`${dest}/fonts`));
    return res;
}

function finish(dest, done) {
    FileIndex.add(LanguageManager.finish(`${dest}/i18n`));
    const config = {
        usedImports: ImportAnalyzer.getUsedImports(
            dest,
            path.resolve(dest, "script/app.js"),
            path.resolve(dest, "sw.js"),
            path.resolve(dest, "index.js"),
            path.resolve(dest, "script/StateRecovery.js"),
            path.resolve(dest, "detached/index.js"),
            path.resolve(dest, "emcJS/util/html/template/HTMLTemplate.js"),
            path.resolve(dest, "emcJS/util/html/template/CSSTemplate.js")
        ),
        ignoreImportPaths: /.*\/(i18n\/fragments\/.*|emcJS\/polyfills\/.*|worker\/.*|StateConverter[0-9]+)\.js/,
        deleteUnused: DELETE_UNUSED_FILES
    };
    FileIndex.finish(dest, undefined, config);
    done();
}

export const build = gulp.series(
    gulp.parallel(
        copyHTML.bind(this, SRC_PATH, PRD_PATH),
        copyJSON.bind(this, SRC_PATH, PRD_PATH),
        copyLogic.bind(this, SRC_PATH, PRD_PATH),
        copyI18N.bind(this, SRC_PATH, PRD_PATH),
        copyI18NFragments.bind(this, SRC_PATH, PRD_PATH),
        copyImg.bind(this, SRC_PATH, PRD_PATH),
        copyCSS.bind(this, SRC_PATH, PRD_PATH),
        copyEmcJSCSS.bind(this, PRD_PATH),
        copyFonts.bind(this, SRC_PATH, PRD_PATH),
        copyScript.bind(this, SRC_PATH, PRD_PATH),
        copyGameTrackerJS.bind(this, PRD_PATH),
        copyEmcJS.bind(this, PRD_PATH),
        copyJSEditors.bind(this, PRD_PATH),
        copyRTCClient.bind(this, PRD_PATH),
        copyArchipelagoJS.bind(this, PRD_PATH),
        copyInitializer.bind(this, SRC_PATH, PRD_PATH),
        copyDetachedScript.bind(this, SRC_PATH, PRD_PATH),
        copyChangelog.bind(this, SRC_PATH, PRD_PATH)
    ),
    finish.bind(this, PRD_PATH)
);

export const buildDev = gulp.series(
    gulp.parallel(
        copyHTML.bind(this, SRC_PATH, DEV_PATH),
        copyJSON.bind(this, SRC_PATH, DEV_PATH),
        copyLogic.bind(this, SRC_PATH, DEV_PATH),
        copyI18N.bind(this, SRC_PATH, DEV_PATH),
        copyI18NFragments.bind(this, SRC_PATH, DEV_PATH),
        copyImg.bind(this, SRC_PATH, DEV_PATH),
        copyCSS.bind(this, SRC_PATH, DEV_PATH),
        copyEmcJSCSS.bind(this, DEV_PATH),
        copyFonts.bind(this, SRC_PATH, DEV_PATH),
        copyScript.bind(this, SRC_PATH, DEV_PATH),
        copyGameTrackerJS.bind(this, DEV_PATH),
        copyEmcJS.bind(this, DEV_PATH),
        copyJSEditors.bind(this, DEV_PATH),
        copyRTCClient.bind(this, DEV_PATH),
        copyArchipelagoJS.bind(this, DEV_PATH),
        copyInitializer.bind(this, SRC_PATH, DEV_PATH),
        copyDetachedScript.bind(this, SRC_PATH, DEV_PATH),
        copyChangelog.bind(this, SRC_PATH, DEV_PATH)
    ),
    finish.bind(this, DEV_PATH)
);

export const watch = function() {
    buildDev();
    return gulp.watch(
        SRC_PATH,
        buildDev
    );
};
