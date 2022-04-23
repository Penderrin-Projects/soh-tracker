export default function parseTrials(errorDialogHandler, target = {}, data = {}, trans = {}) {
    const trial_trans = trans["trials"];

    for (const i in data) {
        const v = data[i];
        if (trial_trans[i] != null) {
            if (Array.isArray(i)) {
                console.warn("Unexpected Array within active trials");
                errorDialogHandler.add("Unexpected Array within active trials");
            } else if (trial_trans[i]["values"][v] === undefined) {
                console.warn("[" + i + ": " + v + "] is a invalid Trials value.");
                errorDialogHandler.add("[" + i + ": " + v + "] is a invalid Trials value.");
            } else {
                target[trial_trans[i]["name"]] = trial_trans[i]["values"][v];
            }
        }
    }
}
