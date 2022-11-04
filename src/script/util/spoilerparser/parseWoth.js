export default function parseWoth(addError, target = {}, data = {}, trans = {}) {
    const woth_trans = trans["woth"];

    target.areaHints = target.areaHints ?? {};

    for (const i in data) {
        if (woth_trans[i] != null) {
            target.areaHints["area/" + woth_trans[i]] = "woth";
        } else {
            addError("[" + i + "] is a invalid Way of the Hero value");
        }
    }
}
