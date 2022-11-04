export default function parseDungeonTypes(addError, target = {}, data = {}, trans = {}) {
    const dungeon_trans = trans["dungeons"];

    target.dungeonTypes = target.dungeonTypes ?? {};

    for (const i in data) {
        const v = data[i];
        if (dungeon_trans[i] != null) {
            if (Array.isArray(i)) {
                addError("Unexpected Array within dungeon types.");
            } else if (dungeon_trans[i]["values"][v] === undefined) {
                addError("[" + i + ": " + v + "] is a invalid Dungeon value");
            } else {
                target.dungeonTypes[dungeon_trans[i]["name"]] = dungeon_trans[i]["values"][v];
            }
        }
    }
}
