export default function parseDungeonRewards(addError, target = {}, data = {}, trans = {}) {
    const location_trans = trans["dungeonReward"];
    const item_trans = trans["itemList"];

    target.dungeonRewards = target.dungeonRewards ?? {};

    for (const i in data) {
        let v = data[i];
        if (location_trans[i] != null) {
            if (typeof v === "object" && v !== null) {
                v = v["item"];
            }

            if (item_trans[v] === undefined) {
                addError("[" + i + ": " + v + "] is a invalid Dungeon Reward value");
            } else {
                target.dungeonRewards[location_trans[i]] = item_trans[v];
            }
        }
    }
}
