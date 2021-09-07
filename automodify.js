const fs = require("fs");

const fileName = "./src/database/world.json";

function modifyData(inData) {
    for (const [key, value] of Object.entries(inData.subarea)) {
        inData.area[key] = value;
    }
    return inData;
}

const inData = JSON.parse(fs.readFileSync(fileName));
const outData = modifyData(inData);

fs.writeFileSync(fileName, JSON.stringify(outData, null, 4));
