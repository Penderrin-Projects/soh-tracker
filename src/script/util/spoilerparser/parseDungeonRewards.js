export default function parseDungeonRewards(errorDialogHandler, target = {}, data = {}, trans = {}) {
    const location_trans = trans["dungeonReward"];
    const item_trans = trans["itemList"];

    const buffer = {};
    for (const i in data) {
        let v = data[i];
        if (location_trans[i] != null) {
            if (typeof v === "object" && v !== null) {v = v["item"];}

            if (item_trans[v] === undefined) {
                console.warn("[" + i + ": " + v + "] is a invalid Dungeon Reward value.");
                errorDialogHandler.add("[" + i + ": " + v + "] is a invalid Dungeon Reward value.");
            } else {
                buffer["area/" + location_trans[i]] = item_trans[v];
            }
        }
    }
    target["dungeonreward"] = buffer;
}
