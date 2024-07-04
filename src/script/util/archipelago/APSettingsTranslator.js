import OptionsTransAPResource from "../../resource/OptionsTransAPResource.js";

const trans = OptionsTransAPResource.get();

const BLACKLISTED_OPTIONS = [
    "collectible_override_flags",
    "collectible_flag_offsets"
];

export function translateAPSettings(data = {}) {
    const target = {
        areaActiveLists: {},
        options: {}
    };
    const errors = [];

    const settingsTrans = trans["settings"];
    const dungeons = trans["dungeons"];
    const tricks = trans["tricks"];

    for (const [key, value] of Object.entries(data)) {
        try {
            if (BLACKLISTED_OPTIONS.includes(key)) {
                // ignore key
                continue;
            }
            if (key === "mq_dungeons_list") {
                for (const dungeonName in dungeons) {
                    const internalName = dungeons[dungeonName];
                    target.areaActiveLists[internalName] = value.includes(dungeonName) ? "mq" : "v";
                }
            } else if (key === "dungeon_shortcuts_list") {
                for (const dungeonName in dungeons) {
                    const internalName = dungeons[dungeonName];
                    target.options[`dungeon_shortcuts.${internalName}`] = value.includes(dungeonName);
                }
            } else if (key === "spawn_positions") {
                target.options["shuffle_spawn_child"] = !!(value & 1);
                target.options["shuffle_spawn_adult"] = !!(value >> 1 & 1);
            } else if (key === "logic_tricks") {
                for (const [apTrick, trick] of Object.entries(tricks)) {
                    target.options[trick] = value.includes(apTrick);
                }
                continue;
            } else {
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
            }
        } catch (err) {
            errors.push(err);
        }
    }

    return [target, errors];
}

window.translateAPSlotData = translateAPSettings;
