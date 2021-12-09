export default function parseWoth(errorDialogHandler, target = {}, data = {}, trans = {}) {
    const woth_trans = trans["woth"];

    for (const i in data) {
        if (woth_trans[i] != null) {
            target["area/" + woth_trans[i]] = "woth";
        } else {
            console.warn("[" + i + "] is a invalid Way of the Hero value.");
            errorDialogHandler.add("[" + i + "] is a invalid Way of the Hero value.");
        }
    }
}
