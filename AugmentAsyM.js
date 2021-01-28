//const fs = require("fs");
var Transform = require('stream').Transform;

const LNBR_SEQ = /(?:\r\n|\n|\r)/g;
const r_import_abs = /import\s*([a-zA-Z0-9_$]+|\{[a-zA-Z0-9_$](?:,\s*[a-zA-Z0-9_$])?\}|[a-zA-Z0-9_$]+,\s*\{[a-zA-Z0-9_$](?:,\s*[a-zA-Z0-9_$])?\})\s*from\s*"(\/[^"]+)";?/;
const r_import_rel = /import\s*([a-zA-Z0-9_$]+|\{[a-zA-Z0-9_$](?:,\s*[a-zA-Z0-9_$])?\}|[a-zA-Z0-9_$]+,\s*\{[a-zA-Z0-9_$](?:,\s*[a-zA-Z0-9_$])?\})\s*from\s*"(.{1,2}\/[^"]+)";?/;
const r_hidden_import_abs = /import\s*"(\/[^"]+)";?/;
const r_hidden_import_rel = /import\s*"(.{1,2}\/[^"]+)";?/;
const r_export = /export\s*default\s*(.*)/;
const r_named_export = /export\s*const\s*([a-zA-Z0-9_$]+)\s*=\s*(.*)/;
const r_function_export = /export\s*((?:async)?\s*function\s*([a-zA-Z0-9_$]+))(.*)/;

function convertFile(fileContent) {
    const imports = [];
    const hidden_imports = [];
    const script = fileContent.split(LNBR_SEQ).map(string => {
        const rIAbs = r_import_abs.exec(string);
        if (rIAbs != null) {
            imports.push([rIAbs[1], `"${rIAbs[2]}"`]);
            return;
        }
        const rIRel = r_import_rel.exec(string);
        if (rIRel != null) {
            imports.push([rIRel[1], `path.getAbsolute(["${rIRel[2]}"])`]);
            return;
        }
        const rHIAbs = r_hidden_import_abs.exec(string);
        if (rHIAbs != null) {
            hidden_imports.push(`"${rHIAbs[1]}"`);
            return;
        }
        const rHIRel = r_hidden_import_rel.exec(string);
        if (rHIRel != null) {
            hidden_imports.push(`path.getAbsolute(["${rHIRel[1]}"])`);
            return;
        }
        const rExp = r_export.exec(string);
        if (rExp != null) {
            return `$__exports.default = ${rExp[1]}`;
        }
        const rNExp = r_named_export.exec(string);
        if (rNExp != null) {
            return `$__exports.${rNExp[1]} = ${rNExp[2]}`;
        }
        const rFExp = r_function_export.exec(string);
        if (rFExp != null) {
            return `$__exports.${rFExp[2]} = ${rFExp[1]}${rFExp[3]}`;
        }
        return string;
    }).filter(e => e != null).join("\n");
    const import_names = [];
    const import_urls = [];
    if (imports.length) {
        for (const [name, url] of imports) {
            import_names.push(`\t\t[${name}]`);
            import_urls.push(`\t\t${url}`);
        }
    }
    if (hidden_imports.length) {
        for (const url of hidden_imports) {
            import_urls.push(`\t\t${url}`);
        }
    }
    let importString = "";
    if (import_names.length) {
        importString += `\n\tconst [\n${import_names.join(",\n")}\n\t] = `;
    } else if (import_urls.length) {
        importString += "\n\t";
    }
    if (import_urls.length) {
        importString += `await AsyM.import([\n${import_urls.join(",\n")}\n\t]);\n\n`;
    }
    return `import Path from "/emcJS/util/Path.js";
import AsyM from "/emcJS/util/import/AsyM.js";
const path = new Path(import.meta.url);
export default new AsyM(async () => {
    const $__exports = {};
    ${importString}
/* ----------------------------------------------------- */
    ${script}
/* ----------------------------------------------------- */
    return $__exports;
});`;
}

//const fileIn = "F:/vscode/TrackOOT/src/GameTrackerJS/ui/item/Item.js";
//const fileOut = "F:/vscode/TrackOOT/TestItem.js";
//const file = fs.readFileSync(fileIn).toString();
//fs.writeFileSync(fileOut, convertFile(file));

module.exports = function () {
    const transformStream = new Transform({ objectMode: true });
    transformStream._transform = function (file, encoding, callback) {
        const contents = convertFile(String(file.contents));
        if (file.isBuffer() === true) {
            file.contents = Buffer.from(contents);
        } else {
            file.contents = contents;
        }
        callback(null, file);
    };
    return transformStream;
};