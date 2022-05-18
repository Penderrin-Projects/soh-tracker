import fs from "fs";
import path from "path";
// import glob from "glob-all";
import through from "through";
// import del from "del";

const LNBR_SEQ = /(?:\r\n|\n|\r)/g;
const LANG_SEQ = /# language:\s+(.*)/;
const MPRT_SEQ = /# fragment:\s+(.*)\.(.*)/;
const FILES = new Map();

function normalizePath(path) {
    return path.replace(/\\/g, "/");
}

function analyzeFile(ref, file) {
    const result = {
        "label": ref,
        "fragments": []
    };
    const fileContent = String(file.contents);
    const lines = fileContent.split(LNBR_SEQ);
    if (lines[0] == "# language file for track-oot") {
        for (const line of lines) {
            const langRes = LANG_SEQ.exec(line);
            if (langRes != null) {
                result["label"] = langRes[1];
            } else {
                const mprtRes = MPRT_SEQ.exec(line);
                if (mprtRes != null) {
                    result["fragments"].push({
                        "type": mprtRes[2],
                        "name": mprtRes[1]
                    });
                }
            }
        }
    }
    return result;
}

class LanguageManager {

    register(src = "/", dest = "/", sourcemaps = false) {
        const files = [];
        return through(function(file) {
            const ref = path.basename(file.path, ".lang");
            const result = analyzeFile(ref, file);
            FILES.set(ref, result);
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
