export default function parseWoth(target = {}, data = {}, trans = {}) {
    const woth_trans = trans["woth"];

    for (const i in data) {
        if (woth_trans[i] != null) {
            target["area/" + woth_trans[i]] = "woth";
        } else {
            console.warn("[" + i + "] is a invalid value. Please report this bug")
        }
    }
}
