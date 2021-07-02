export default function parseDungeonTypes(target = {}, data = {}, trans = {}) {
    const dungeon_trans = trans["dungeons"];

    const buffer = {};
    for (const i in data) {
        const v = data[i];
        if (dungeon_trans[i] != null) {
            if (Array.isArray(i)) {
                console.warn("Unexpected Array within dungeon types, please report this!")
            } else {
                if (dungeon_trans[i]["values"][v] === undefined) {
                    console.warn("[" + i + ": " + v + "] is a invalid value. Please report this bug")
                } else {
                    buffer["area/" + dungeon_trans[i]["name"]] = dungeon_trans[i]["values"][v];
                }
            }
        }
    }
    target["dungeontype"] = buffer;
}
