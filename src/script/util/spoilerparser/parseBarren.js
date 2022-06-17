export default function parseBarren(addError, target = {}, data = {}, trans = {}) {
    const barren_trans = trans["barren"];
    let castle = 0;

    target.areaHints = target.areaHints ?? {};

    const bar = new Set(data);

    bar.forEach((i) => {
        if (barren_trans[i] != null) {
            if (barren_trans[i] === "castle") {
                castle++;
                if (castle === 2) {
                    target.areaHints["area/" + barren_trans[i]] = "barren";
                }
            } else {
                target.areaHints["area/" + barren_trans[i]] = "barren";
            }
        } else {
            addError("[" + i + "] is a invalid Barren value.");
        }
    });
}
