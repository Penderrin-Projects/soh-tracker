export default function parseDungeonRewards(target = {}, data = {}, trans = {}) {
    const location_trans = trans["dungeonReward"];
    const item_trans = trans["itemList"];

    const buffer = {};
    for (const i in data) {
        let v = data[i];
        if (location_trans[i] != null) {
            if (typeof v === "object" && v !== null) v = v["item"];

            if (item_trans[v] === undefined) {
                console.warn("[" + i + ": " + v + "] is a invalid value. Please report this bug")
            } else {
                buffer["area/" + location_trans[i]] = item_trans[v];
            }
        }
    }
    target["dungeonreward"] = buffer;
}
