import OptionsTransAPResource from "../../resource/OptionsTransAPResource.js";

const trans = OptionsTransAPResource.get();

export function translateAPSettings(data = {}) {
    const target = {
        areaActiveLists: {},
        options: {}
    };
    const errors = [];

    const settingsTrans = trans["settings"];
    const dungeons = trans["dungeons"];
    const tricks = trans["tricks"];

    const {
        spawn_positions,
        logic_tricks,
        dungeon_shortcuts,
        dungeon_shortcuts_list,
        mq_dungeons_mode,
        mq_dungeons_list,
        mq_dungeons_count,
        ...rest_data
    } = data;

    // spawn positions
    target.options["shuffle_spawn_child"] = !!(spawn_positions & 1);
    target.options["shuffle_spawn_adult"] = !!(spawn_positions >> 1 & 1);

    // tricks
    for (const [apTrick, trick] of Object.entries(tricks)) {
        target.options[trick] = logic_tricks.includes(apTrick);
    }

    // dungeon shortcuts
    if (dungeon_shortcuts === 0) {
        for (const dungeonName in dungeons) {
            const internalName = dungeons[dungeonName];
            target.options[`dungeon_shortcuts.${internalName}`] = false;
        }
    } else if (dungeon_shortcuts === 1) {
        for (const dungeonName in dungeons) {
            const internalName = dungeons[dungeonName];
            target.options[`dungeon_shortcuts.${internalName}`] = dungeon_shortcuts_list.includes(dungeonName);
        }
    } else if (dungeon_shortcuts === 2) {
        for (const dungeonName in dungeons) {
            const internalName = dungeons[dungeonName];
            target.options[`dungeon_shortcuts.${internalName}`] = true;
        }
    }

    // mq dungeons
    if (mq_dungeons_mode === 0 || (mq_dungeons_mode === 3 && mq_dungeons_count === 0)) {
        for (const dungeonName in dungeons) {
            const internalName = dungeons[dungeonName];
            target.areaActiveLists[internalName] = "v";
        }
    } else if (mq_dungeons_mode === 1 || (mq_dungeons_mode === 3 && mq_dungeons_count === 12)) {
        for (const dungeonName in dungeons) {
            const internalName = dungeons[dungeonName];
            target.areaActiveLists[internalName] = "mq";
        }
    } else if (mq_dungeons_mode === 2) {
        for (const dungeonName in dungeons) {
            const internalName = dungeons[dungeonName];
            target.areaActiveLists[internalName] = mq_dungeons_list.includes(dungeonName) ? "mq" : "v";
        }
    }

    // other settings
    for (const [key, value] of Object.entries(rest_data)) {
        try {
            const transData = settingsTrans[key];
            if (transData == null) {
                errors.push(`no valid translation found for option "${key}"`);
                continue;
            } else if (transData === false) {
                // ignore key
                continue;
            } else {
                const parsedValue = parseInt(value) || 0;
                if (typeof transData === "string") {
                    target.options[transData] = parsedValue;
                } else {
                    const {name, values, overwrite = false} = transData;
                    const transValue = values[parsedValue];
                    if (transValue == null) {
                        // ignore value
                        continue;
                    } else if (overwrite || target.options[name] == null) {
                        target.options[name] = transValue;
                    }
                }
            }
        } catch (err) {
            errors.push(err);
        }
    }

    return [target, errors];
}

window.translateAPSlotData = translateAPSettings;
