import spoilerErrorAlert from "./spoilerErrorAlert.js";

export default function parseDisabledLocations(target = {}, data = {}, trans = {}) {
    const location_trans = trans["locations"];
    const location_hearts_mq = location_trans["MQ"];

    for (const i of data) {
        if (location_trans[i] != null) {
            if (location_trans[i] !== "") {
                target["location/" + location_trans[i]] = true;
                if (location_hearts_mq[i] != null) {
                    target["location/" + location_hearts_mq[i]] = true;
                }
            }
        } else {
            console.warn("[" + i + "] is a invalid Location value.")
            spoilerErrorAlert.prepareAlert();
        }
    }
}
