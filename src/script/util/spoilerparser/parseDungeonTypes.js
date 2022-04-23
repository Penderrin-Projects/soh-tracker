export default function parseDungeonTypes(errorDialogHandler, target = {}, data = {}, trans = {}) {
    const dungeon_trans = trans["dungeons"];

    const buffer = {};
    for (const i in data) {
        const v = data[i];
        if (dungeon_trans[i] != null) {
            if (Array.isArray(i)) {
                console.warn("Unexpected Array within dungeon types.");
                errorDialogHandler.add("Unexpected Array within dungeon types.");
            } else if (dungeon_trans[i]["values"][v] === undefined) {
                console.warn("[" + i + ": " + v + "] is a invalid Dungeon value.");
                errorDialogHandler.add("[" + i + ": " + v + "] is a invalid Dungeon value.");
            } else {
                buffer["area/" + dungeon_trans[i]["name"]] = dungeon_trans[i]["values"][v];
            }
        }
    }
    target["dungeontype"] = buffer;
}
