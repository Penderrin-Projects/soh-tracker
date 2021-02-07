const fs = require("fs");

const fileName = "./src/database/world.json";

function modifyData(inData) {
    for (const [, value] of Object.entries(inData.marker.area)) {
        value.filter["filter.show_done"] = {
            "false": "!done"
        }
    }
    for (const [, value] of Object.entries(inData.marker.exit)) {
        value.filter["filter.show_done"] = {
            "false": "!done"
        }
    }
    for (const [, value] of Object.entries(inData.marker.location)) {
        value.filter["filter.show_done"] = {
            "false": "!done"
        }
    }
    for (const [, value] of Object.entries(inData.marker.subarea)) {
        value.filter["filter.show_done"] = {
            "false": "!done"
        }
    }
    for (const [, value] of Object.entries(inData.marker.subexit)) {
        value.filter["filter.show_done"] = {
            "false": "!done"
        }
    }
    return inData;
}

const inData = JSON.parse(fs.readFileSync(fileName));
const outData = modifyData(inData);

fs.writeFileSync(fileName, JSON.stringify(outData, null, 4));
