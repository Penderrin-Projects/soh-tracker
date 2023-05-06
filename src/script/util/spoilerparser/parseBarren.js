export default function parseBarren(addError, target = {}, data = {}, trans = {}) {
    const barren_trans = trans["barren"];
    let castle = 0;

    target.areaHints = target.areaHints ?? {};

    const bar = new Set(data);

    for (const i of bar) {
        const transValue = getTransValue(barren_trans, i);
        if (transValue != null) {
            if (transValue === "castle") {
                castle++;
                if (castle === 2) {
                    target.areaHints["area/" + transValue] = "barren";
                }
            } else {
                target.areaHints["area/" + transValue] = "barren";
            }
        } else {
            addError("[" + i + "] is a invalid Barren value");
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
