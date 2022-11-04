export default function parseEntrances(addError, target = {}, data = {}, trans = {}, opt = {}) {
    const {
        dungeon,
        bossarea,
        grottos,
        indoors,
        overworld,
        owls,
        spawns,
        warps
    } = opt;

    const {
        entro_dungeons,
        entro_dungeon_bosses,
        entro_grottos,
        entro_simple,
        entro_indoors,
        entro_overworld,
        entro_owls,
        entro_spawns,
        entro_warps
    } = trans.entrances.entrances;

    const {
        exit_dungeons,
        exit_dungeon_bosses,
        exit_grottos,
        exit_simple,
        exit_indoors,
        exit_overworld,
        exit_extras
    } = trans.entrances.exits;

    const entrance = {
        entro_dungeon: entro_dungeons,
        entro_dungeon_boss: entro_dungeon_bosses,
        entro_grottos: entro_grottos,
        entro_simple: entro_simple,
        entro_indoors: entro_indoors,
        entro_overworld: entro_overworld,
        entro_owls: entro_owls,
        entro_spawns: entro_spawns,
        entro_warps: entro_warps
    };

    const exit = {
        exit_dungeon: exit_dungeons,
        exit_dungeon_boss: exit_dungeon_bosses,
        exit_grottos: exit_grottos,
        exit_simple: exit_simple,
        exit_indoors: exit_indoors,
        exit_overworld: exit_overworld,
        exit_extra: exit_extras
    };

    target.exitBindings = target.exitBindings ?? {};

    for (const i in data) {
        let v = data[i];
        if (typeof v === "object" && v !== null) {
            if (exit_overworld[data[i]["region"] + " -> " + data[i]["from"]]) {
                v = data[i]["region"] + " -> " + data[i]["from"];
            } else {
                v = data[i]["region"];
            }
        }
        let edgeThere = null;
        let edgeBack = null;
        let node = null;

        for (const ent in entrance) {
            node = entrance[ent]
            if (node[i] !== undefined) {
                edgeThere = node[i];
            }
        }
        for (const ent in exit) {
            node = exit[ent]
            if (node[v] !== undefined) {
                edgeBack = node[v]
            }
        }

        if (typeof i === "object" && i !== null) {
            addError("Unexpected Array within entrances");
        } else if (edgeThere === null) {
            addError("[" + i + ": " + v + "] is a invalid Entrance value (forward).");
        } else if (edgeBack === null) {
            addError("[" + i + ": " + v + "] is a invalid Entrance value (backwards).");
        } else {
            if (dungeon) {
                if (entro_dungeons[i] === edgeThere) {
                    target.exitBindings[edgeThere] = edgeBack;
                }
            }
            if (bossarea) {
                if (entro_dungeon_bosses[i] === edgeThere) {
                    target.exitBindings[edgeThere] = edgeBack;
                }
            }
            if (grottos) {
                if (entro_grottos[i] === edgeThere) {
                    target.exitBindings[edgeThere] = edgeBack;
                }
            }
            if (indoors) {
                if (entro_simple[i] === edgeThere || entro_indoors[i] === edgeThere) {
                    target.exitBindings[edgeThere] = edgeBack;
                }
            }
            if (overworld) {
                if (entro_overworld[i] === edgeThere) {
                    target.exitBindings[edgeThere] = edgeBack;
                }
            }
            if (owls) {
                if (entro_owls[i] === edgeThere) {
                    target.exitBindings[edgeThere] = edgeBack;
                }
            }
            if (spawns) {
                if (entro_spawns[i] === edgeThere) {
                    target.exitBindings[edgeThere] = edgeBack;
                }
            }
            if (warps) {
                if (entro_warps[i] === edgeThere) {
                    target.exitBindings[edgeThere] = edgeBack;
                }
            }
        }
    }
}
