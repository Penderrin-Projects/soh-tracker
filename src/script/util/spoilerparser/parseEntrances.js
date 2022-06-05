export default function parseEntrances(errorDialogHandler, target = {}, data = {}, trans = {}, opt = {}) {
    const {dungeon, grottos, indoors, overworld, owls, spawns, warps} = opt;
    const {entro_dungeons, entro_grottos, entro_simple, entro_indoors, entro_overworld, entro_owls, entro_spawns, entro_warps} = trans.entrances.entrances;
    const {exit_dungeons, exit_grottos, exit_simple, exit_indoors, exit_overworld, exit_extras} = trans.entrances.exits;
    const entrance = {entro_dungeon: entro_dungeons, entro_grottos: entro_grottos, entro_simple: entro_simple, entro_indoors: entro_indoors, entro_overworld: entro_overworld, entro_owls: entro_owls, entro_spawns: entro_spawns, entro_warps: entro_warps}
    const exit = {exit_dungeon: exit_dungeons, exit_grottos: exit_grottos, exit_simple: exit_simple, exit_indoors: exit_indoors, exit_overworld: exit_overworld, exit_extra: exit_extras}

    const buffer = {};

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
            console.warn("Unexpected Array within entrances.");
            errorDialogHandler.add("Unexpected Array within entrances.");
        } else if (edgeThere === null || edgeBack === null) {
            console.warn("[" + i + ": " + v + "] is a invalid Entrance value.");
            errorDialogHandler.add("[" + i + ": " + v + "] is a invalid Entrance value.");
        } else {
            if (dungeon) {
                if (entro_dungeons[i] === edgeThere) {
                    buffer[edgeThere] = edgeBack;
                }
            }
            if (grottos) {
                if (entro_grottos[i] === edgeThere) {
                    buffer[edgeThere] = edgeBack;
                }
            }
            if (indoors) {
                if (entro_simple[i] === edgeThere || entro_indoors[i] === edgeThere) {
                    buffer[edgeThere] = edgeBack;
                }
            }
            if (overworld) {
                if (entro_overworld[i] === edgeThere) {
                    buffer[edgeThere] = edgeBack;
                }
            }
            if (owls) {
                if (entro_owls[i] === edgeThere) {
                    buffer[edgeThere] = edgeBack;
                }
            }
            if (spawns) {
                if (entro_spawns[i] === edgeThere) {
                    buffer[edgeThere] = edgeBack;
                }
            }
            if (warps) {
                if (entro_warps[i] === edgeThere) {
                    buffer[edgeThere] = edgeBack;
                }
            }
        }
    }
    target.exitBindings = buffer;
}
