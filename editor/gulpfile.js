import path from "path";
import gulp from "gulp";
import htmlmin from "gulp-htmlmin";
import jsonminify from "gulp-jsonminify";
import svgo from "gulp-svgo";
import newer from "gulp-newer";
import autoprefixer from "gulp-autoprefixer";
import FileIndex from "emcjs/_build_tools/FileIndex.js";
import ImageIndex from "emcJS/_build_tools/ImageIndex.js.js";
import LanguageManager from "emcjs/_build_tools/LanguageManager.js";
import sourceImport from "emcjs/_build_tools/sourceImport.js";
import ImportAnalyzer from "emcjs/_build_tools/ImportAnalyzer.js";

const __dirname = path.resolve("..");

const NODE_FOLDER = path.resolve(__dirname, "node_modules");

const SRC_PATH = path.resolve(__dirname, "editor/src");
const BUILD_PATH = path.resolve(__dirname, "editor/build");

const TRACKER_SRC_PATH = path.resolve(__dirname, "src");

const MODULE_PATHS = {
    emcJS: path.resolve(NODE_FOLDER, "emcjs/src"),
    GameTrackerJS: path.resolve(NODE_FOLDER, "gametrackerjs/src"),
    JSEditors: path.resolve(NODE_FOLDER, "jseditors/src")
};

/* configuration */
const DELETE_UNUSED_FILES = true;
const NOCOMPRESS = process.argv.indexOf("-nocompress") >= 0;
const REBUILD = process.argv.indexOf("-rebuild") >= 0;
const REBUILDJS = process.argv.indexOf("-rebuildjs") >= 0;

console.log({NOCOMPRESS, REBUILDJS, REBUILD});

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

function copyEmcJS() {
    const FILES = [
        `${MODULE_PATHS.emcJS}/**/*.js`,
        `!${MODULE_PATHS.emcJS}/*.js`
    ];
    const SRC = MODULE_PATHS.emcJS;
    const DST = `${BUILD_PATH}/emcJS`;
    return copyJS(FILES, SRC, DST, BUILD_PATH);
}

function copyGameTrackerJS() {
    const FILES = [
        `${MODULE_PATHS.GameTrackerJS}/**/*.js`,
        `!${MODULE_PATHS.GameTrackerJS}/*.js`
    ];
    const SRC = MODULE_PATHS.GameTrackerJS;
    const DST = `${BUILD_PATH}/GameTrackerJS`;
    return copyJS(FILES, SRC, DST, BUILD_PATH);
}

function copyJSEditors() {
    const FILES = [
        `${MODULE_PATHS.JSEditors}/**/*.js`,
        `!${MODULE_PATHS.JSEditors}/node_modules/**/*.js`
    ];
    const SRC = MODULE_PATHS.JSEditors;
    const DST = `${BUILD_PATH}/JSEditors`;
    return copyJS(FILES, SRC, DST, BUILD_PATH);
}

function copyScript() {
    const FILES = [
        `${SRC_PATH}/**/*.js`
    ];
    return copyJS(FILES, SRC_PATH, BUILD_PATH, BUILD_PATH);
}
/* JS END */

function copyEmcJSCSS() {
    const FILES = [
        `${MODULE_PATHS.emcJS}/**/*.css`
    ];
    const DST = `${BUILD_PATH}/emcJS`;
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(MODULE_PATHS.emcJS, DST));
    if (!REBUILD) {
        res = res.pipe(newer(DST));
    }
    res = res.pipe(autoprefixer());
    res = res.pipe(gulp.dest(DST));
    return res;
}

function copyHTML() {
    const FILES = [
        `${SRC_PATH}/**/*.html`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(SRC_PATH, BUILD_PATH));
    if (!REBUILD) {
        res = res.pipe(newer(BUILD_PATH));
    }
    res = res.pipe(htmlmin({collapseWhitespace: true}));
    res = res.pipe(gulp.dest(BUILD_PATH));
    return res;
}

function copyJSON() {
    const FILES = [
        `${SRC_PATH}/**/*.json`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(SRC_PATH, BUILD_PATH));
    if (!REBUILD) {
        res = res.pipe(newer(BUILD_PATH));
    }
    if (!NOCOMPRESS) {
        res = res.pipe(jsonminify());
    }
    res = res.pipe(gulp.dest(BUILD_PATH));
    return res;
}

function copyCSS() {
    const FILES = [
        `${SRC_PATH}/**/*.css`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(SRC_PATH, BUILD_PATH));
    if (!REBUILD) {
        res = res.pipe(newer(BUILD_PATH));
    }
    res = res.pipe(autoprefixer());
    res = res.pipe(gulp.dest(BUILD_PATH));
    return res;
}

function copyFonts() {
    const FILES = [
        `${SRC_PATH}/fonts/**/*.ttf`,
        `${SRC_PATH}/fonts/**/*.eot`,
        `${SRC_PATH}/fonts/**/*.otf`,
        `${SRC_PATH}/fonts/**/*.woff`,
        `${SRC_PATH}/fonts/**/*.woff2`,
        `${SRC_PATH}/fonts/**/*.svg`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${SRC_PATH}/fonts`, `${BUILD_PATH}/fonts`));
    if (!REBUILD) {
        res = res.pipe(newer(`${BUILD_PATH}/fonts`));
    }
    res = res.pipe(gulp.dest(`${BUILD_PATH}/fonts`));
    return res;
}

// ------------------------------------

// TODO compile language
function copyTrackerI18N() {
    const FILES = [
        `${TRACKER_SRC_PATH}/i18n/*.lang`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${TRACKER_SRC_PATH}/i18n`, `${BUILD_PATH}/i18n`));
    res = res.pipe(LanguageManager.register(`${TRACKER_SRC_PATH}/i18n`, `${BUILD_PATH}/i18n`));
    if (!REBUILD) {
        res = res.pipe(newer(`${BUILD_PATH}/i18n`));
    }
    res = res.pipe(gulp.dest(`${BUILD_PATH}/i18n`));
    return res;
}

function copyTrackerI18NFragments() {
    const FILES = [
        `${TRACKER_SRC_PATH}/i18n/fragments/**/*.js`,
        `${TRACKER_SRC_PATH}/i18n/fragments/**/*.json`,
        `${TRACKER_SRC_PATH}/i18n/fragments/**/*.lang`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${TRACKER_SRC_PATH}/i18n/fragments`, `${BUILD_PATH}/i18n/fragments`));
    if (!REBUILD) {
        res = res.pipe(newer(`${BUILD_PATH}/i18n/fragments`));
    }
    res = res.pipe(gulp.dest(`${BUILD_PATH}/i18n/fragments`));
    return res;
}

function copyTrackerImg() {
    const FILES = [
        `${TRACKER_SRC_PATH}/images/**/*.svg`,
        `${TRACKER_SRC_PATH}/images/**/*.png`,
        `${TRACKER_SRC_PATH}/images/**/*.webp`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${TRACKER_SRC_PATH}/images`, `${BUILD_PATH}/images`));
    res = res.pipe(ImageIndex.register(`${TRACKER_SRC_PATH}/images`, `${BUILD_PATH}/images`));
    if (!REBUILD) {
        res = res.pipe(newer(`${BUILD_PATH}/images`));
    }
    res = res.pipe(svgo());
    res = res.pipe(gulp.dest(`${BUILD_PATH}/images`));
    return res;
}

// ------------------------------------

function finish(done) {
    FileIndex.add(LanguageManager.finish(`${BUILD_PATH}/i18n`));
    const config = {
        usedImports: ImportAnalyzer.getUsedImports(
            BUILD_PATH,
            path.resolve(BUILD_PATH, "index.js"),
            path.resolve(BUILD_PATH, "emcJS/util/html/Template.js"),
            path.resolve(BUILD_PATH, "emcJS/util/html/GlobalStyle.js")
        ),
        ignoreImportPaths: /.*\/(i18n\/fragments\/.*|emcJS\/polyfills\/.*)\.js/,
        deleteUnused: DELETE_UNUSED_FILES
    };
    FileIndex.finish(BUILD_PATH, undefined, config);
    ImageIndex.finish(BUILD_PATH, "images/_index.icons.json", /^\/images\/icons\/.*/);
    ImageIndex.finish(BUILD_PATH, "images/_index.maps.json", /^\/images\/maps\/.*/, /^\/images\/maps\/(.*)\.[^.]+$/);
    done();
}

export const build = gulp.series(
    gulp.parallel(
        copyHTML,
        copyJSON,
        copyCSS,
        copyFonts,
        // ---
        copyTrackerI18N,
        copyTrackerI18NFragments,
        copyTrackerImg,
        // ---
        copyEmcJS,
        copyEmcJSCSS,
        copyGameTrackerJS,
        copyJSEditors,
        copyScript
    ),
    finish
);

export const watch = function() {
    build();
    return gulp.watch([
        MODULE_PATHS.emcJS,
        MODULE_PATHS.GameTrackerJS,
        MODULE_PATHS.JSEditors,
        SRC_PATH
    ], build);
};
