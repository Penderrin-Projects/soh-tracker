export default function parseItemLocations(target = {}, data = {}, targetWorld = null, worldLocking = false, trans = {}) {
    const location_trans = trans["locations"];
    const location_hearts_mq = location_trans["MQ"];
    const item_trans = trans["itemList"];

    const buffer = {};

    for (const i in data) {
        if (location_trans[i] != null) {
            let v = data[i];
            let player = 1;
            if (typeof v === "object" && v !== null) {
                if (v["player"] !== undefined) player = v["player"];
                v = v["item"];
            }
            if (location_trans[i] !== "") {
                if (item_trans[v] === undefined) {
                    console.warn("[" + v + "] is a invalid value. Please report this bug")
                } else {
                    if (targetWorld == null || player === targetWorld || worldLocking) buffer["location/" + location_trans[i]] = item_trans[v];
                    if (location_hearts_mq[i] != null) {
                        buffer["location/" + location_hearts_mq[i]] = item_trans[v];
                    }
                }
            }
        } else {
            console.warn("[" + i + "] is a invalid value. Please report this bug")
        }
    }
    target["item_location"] = buffer;
}
