import fs from "fs";
import path from "path";
import TypeConfigMap from "emcJS/data/type/TypeConfigMap.js";
import TypeGenerator from "emcJS/util/type/TypeGenerator.js";

const typeFolderPath = "./node_modules/gametrackerjs/_types";
const inFileName = "./src/database/world.json";
const outFileName = "./src/database/world.json";

// if the folder exists
if (fs.existsSync(typeFolderPath)) {
    const typeDefs = {};
    const folderContent = fs.readdirSync(typeFolderPath);
    for (const filePath of folderContent) {
        const resolvedFilePath = path.resolve(typeFolderPath, filePath);
        // if the file exists
        if (fs.existsSync(resolvedFilePath)) {
            const parsedPath = path.parse(filePath);
            const name = parsedPath.name;
            try {
                typeDefs[name] = JSON.parse(fs.readFileSync(resolvedFilePath));
            } catch (err) {
                console.error(`could not load type config for "${name}"`, err);
            }
        }
    }

    try {
        TypeConfigMap.registerAll(typeDefs);
    } catch (err) {
        console.error(err);
    }
}

/* files */

const inData = JSON.parse(fs.readFileSync(inFileName));
const outData = TypeGenerator.generate("World", inData, false);
fs.writeFileSync(outFileName, JSON.stringify(outData, null, 4) + "\n");
