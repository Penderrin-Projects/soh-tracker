import fs from "fs";
import path from "path";
import TypeConfigMap from "emcJS/data/type/TypeConfigMap.js";
import TypeValidator from "emcJS/util/type/TypeValidator.js";

// TODO make packae dependend and verify more than just world file
// TODO use this as pre compile requirement

const typeFolderPath = path.resolve("../GameTrackerJS/_types/");
const typeFileNames = fs.readdirSync(typeFolderPath);

const types = {};
for (const fileName of typeFileNames) {
    const typeFilePath = path.resolve(typeFolderPath, fileName);
    const typeName = path.parse(typeFilePath).name;
    types[typeName] = JSON.parse(fs.readFileSync(typeFilePath));
}

TypeConfigMap.registerAll(types);

const inFileName = "./src/database/world.json";

const inData = JSON.parse(fs.readFileSync(inFileName));
try {
    console.log("\n==== World ====");
    TypeValidator.validate("World", inData);
    console.log("ok\n");
} catch (err) {
    console.error(err.message);
}

