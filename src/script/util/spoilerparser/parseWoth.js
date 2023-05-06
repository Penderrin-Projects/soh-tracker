export default function parseWoth(addError, target = {}, data = {}, trans = {}) {
    const woth_trans = trans["woth"];

    target.areaHints = target.areaHints ?? {};

    for (const i in data) {
        const transValue = getTransValue(woth_trans, i);
        if (transValue != null) {
            target.areaHints["area/" + transValue] = "woth";
        } else {
            addError("[" + i + "] is a invalid Way of the Hero value");
        }
    }
}

function getTransValue(source, key) {
    const res = source[key];
    if (res != null) {
        return res;
    }
    if (key.startsWith("the ")) {
        return source[key.slice(4)];
    }
}
