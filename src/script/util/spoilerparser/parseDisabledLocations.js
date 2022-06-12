export default function parseDisabledLocations(errorDialogHandler, target = {}, data = {}, trans = {}) {
    const location_trans = trans["locations"];
    const location_hearts_mq = location_trans["MQ"];

    for (const i of data) {
        if (location_trans[i] != null) {
            if (location_trans[i] !== "") {
                target.locations[location_trans[i]] = true;
                if (location_hearts_mq[i] != null) {
                    target.locations[location_hearts_mq[i]] = true;
                }
            }
        } else {
            console.warn("[" + i + "] is a invalid Location value.");
            errorDialogHandler.add("[" + i + "] is a invalid Location value.");
        }
    }
}
