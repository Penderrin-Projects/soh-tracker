import fs from "fs";
import path from "path";
// import glob from "glob-all";
import through from "through";
// import del from "del";

const LNBR_SEQ = /(?:\r\n|\n|\r)/g;
const LANG_SEQ = /# language:\s+(.*)/;
const FILES = new Map();

function normalizePath(path) {
    return path.replace(/\\/g, "/");
}

function getLanguage(file) {
    const fileContent = String(file.contents);
    const lines = fileContent.split(LNBR_SEQ);
    if (lines[0] == "# language file for track-oot" && lines[1].startsWith("# language:")) {
        const res = LANG_SEQ.exec(lines[1]);
        if (res != null) {
            return res[1];
        }
    }
}

class LanguageManager {

    register(src = "/", dest = "/", sourcemaps = false) {
        const files = [];
        return through(function(file) {
            const lang = getLanguage(file);
            if (lang != null) {
                FILES.set(path.basename(file.path, ".lang"), lang);
            }
            this.push(file);
            return files.push(file);
        }, function() {
            return this.emit("end");
        });
    }

    finish(dest = "/", metaFile = "_meta.json") {
        const metaPath = path.resolve(dest, metaFile);
        const metaPathNormal = normalizePath(metaPath);
        console.log(`i18n meta file: ${metaPathNormal}`);
        const files = Object.fromEntries(FILES.entries());
        fs.writeFileSync(metaPath, JSON.stringify(files, null, 4));
        FILES.clear();
        return metaPath;
    }

}

export default new LanguageManager();
