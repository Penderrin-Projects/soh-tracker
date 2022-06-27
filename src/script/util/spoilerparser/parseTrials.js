export default function parseTrials(addError, target = {}, data = {}, trans = {}) {
    const trial_trans = trans["trials"];

    target.options = target.options ?? {};

    for (const i in data) {
        const v = data[i];
        if (trial_trans[i] != null) {
            if (Array.isArray(i)) {
                addError("Unexpected Array within active trials");
            } else if (trial_trans[i]["values"][v] === undefined) {
                addError("[" + i + ": " + v + "] is a invalid Trials value");
            } else {
                target.options[trial_trans[i]["name"]] = trial_trans[i]["values"][v];
            }
        }
    }
}
