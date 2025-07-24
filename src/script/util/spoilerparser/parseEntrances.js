export default function parseEntrances(addError, target = {}, data = {}, trans = {}, opt = {}) {
    target.exitBindings = target.exitBindings ?? {};

    for (const i in data) {
        if (typeof i !== "string" || i === "") {
            addError(`Unexpected key "${i}" [${typeof i}] in entrance value`, "Entrances");
            continue;
        }

        let v = data[i];
        if (typeof v === "object" && v !== null) {
            v = data[i]["region"] + " -> " + data[i]["from"];
        }

        const [category, edgeThere] = getEntranceCategoryAndTranslation(trans.entrances, i);
        if (edgeThere == null) {
            addError(`"${i}" is a invalid entrance value`, "Entrances");
            continue;
        }
        const [, edgeBack] = getExitCategoryAndTranslation(trans.entrances, v);
        if (edgeBack === null) {
            addError(`"${v}" is a invalid exit value`, "Entrances");
            continue;
        }

        switch (category) {
            case "grottos": {
                if (opt.grottos) {
                    target.exitBindings[edgeThere] = edgeBack;
                }
            } break;
            case "simple_interiors":
            case "other_interiors": {
                if (opt.indoors) {
                    target.exitBindings[edgeThere] = edgeBack;
                }
            } break;
            case "dungeons": {
                if (opt.dungeon) {
                    target.exitBindings[edgeThere] = edgeBack;
                }
            } break;
            case "dungeon_bosses": {
                if (opt.bossarea) {
                    target.exitBindings[edgeThere] = edgeBack;
                }
            } break;
            case "overworld": {
                if (opt.overworld) {
                    target.exitBindings[edgeThere] = edgeBack;
                }
            } break;
            case "owls": {
                if (opt.owls) {
                    target.exitBindings[edgeThere] = edgeBack;
                }
            } break;
            case "spawns": {
                if (opt.spawns) {
                    target.exitBindings[edgeThere] = edgeBack;
                }
            } break;
            case "warps": {
                if (opt.warps) {
                    target.exitBindings[edgeThere] = edgeBack;
                }
            } break;
        }
    }
}

function getEntranceCategoryAndTranslation(entrances, needle) {
    if (needle.includes(" -> ")) {
        for (const [category, values] of Object.entries(entrances)) {
            const translation = values[needle];
            if (translation != null) {
                return [category, translation];
            }
        }
    } else {
        needle = ` -> ${needle}`;
        for (const [category, values] of Object.entries(entrances)) {
            for (const [key, translation] of Object.entries(values)) {
                if (key.endsWith(needle)) {
                    return [category, translation];
                }
            }
        }
    }
    return [null, null];
}

function getExitCategoryAndTranslation(entrances, needle) {
    if (needle.includes(" -> ")) {
        for (const [category, values] of Object.entries(entrances)) {
            const translation = values[needle];
            if (translation != null) {
                return [category, translation];
            }
        }
    } else {
        needle = `${needle} -> `;
        for (const [category, values] of Object.entries(entrances)) {
            for (const [key, translation] of Object.entries(values)) {
                if (key.startsWith(needle)) {
                    return [category, translation];
                }
            }
        }
    }
    return [null, null];
}
