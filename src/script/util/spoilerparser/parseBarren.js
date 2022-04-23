export default function parseBarren(errorDialogHandler, target = {}, data = {}, trans = {}) {
    const barren_trans = trans["barren"];
    let castle = 0;

    const bar = new Set(data);

    bar.forEach(i => {
        if (barren_trans[i] != null) {
            if (barren_trans[i] === "castle") {
                castle++;
                if (castle === 2) {target["area/" + barren_trans[i]] = "barren";}
            } else {
                target["area/" + barren_trans[i]] = "barren";
            }
        } else {
            console.warn("[" + i + "] is a invalid Barren value.");
            errorDialogHandler.add("[" + i + "] is a invalid Barren value.");
        }
    });
}
