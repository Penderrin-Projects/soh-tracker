export default function parseTrials(target = {}, data = {}, trans = {}) {
    const trial_trans = trans["trials"];

    for (const i in data) {
        const v = data[i];
        if (trial_trans[i] != null) {
            if (Array.isArray(i)) {
                console.warn("Unexpected Array within active trials, please report this!")
            } else {
                if (trial_trans[i]["values"][v] === undefined) {
                    console.warn("[" + i + ": " + v + "] is a invalid value. Please report this bug")
                } else {
                    target[trial_trans[i]["name"]] = trial_trans[i]["values"][v];
                }
            }
        }
    }
}
