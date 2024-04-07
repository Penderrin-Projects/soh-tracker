import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";

const URL = import.meta.url;
const PATH_REGEX = /(.*)\.js$/;
const PATH = PATH_REGEX.exec(URL)[1];

const OFFSET = 0;
let counter = OFFSET;

while (counter >= 0) {
    try {
        await import(`${PATH}${counter++}.js`);
    } catch {
        break;
    }
}

SavestateConverter.offset = OFFSET;
