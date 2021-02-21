const fs = require("fs");

const fileName = "./src/database/world.json";

function modifyData(inData) {
    for (const [, value] of Object.entries(inData.marker.exit)) {
        if (!value.filter["filter.era"]["child"] && !value.filter["filter.era"]["adult"]) {
            value.filter["filter.era"] = {
                "child": true,
                "adult": true
            }
        }
        if (!value.filter["filter.time"]["day"] && !value.filter["filter.time"]["night"]) {
            value.filter["filter.time"] = {
                "day": true,
                "night": true
            }
        }
    }
    return inData;
}

const inData = JSON.parse(fs.readFileSync(fileName));
const outData = modifyData(inData);

fs.writeFileSync(fileName, JSON.stringify(outData, null, 4));
