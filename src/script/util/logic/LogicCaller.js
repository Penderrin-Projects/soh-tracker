/* asym-import: off */
import EventBus from "/emcJS/event/EventBus.js";
/* asym-import: on */

// GameTrackerJS
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import OptionsStorage from "/GameTrackerJS/storage/OptionsStorage.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";
import FilterStorage from "/GameTrackerJS/storage/FilterStorage.js";
import Logic from "/GameTrackerJS/util/logic/Logic.js";
// Track-OOT
import DungeonstateResource from "/script/resource/DungeonstateResource.js";

// TODO register settings event listener

const ACCEPTED_KEY_GROUPS = [
    "dungeon",
    "gerudo",
    "ganon"
];

const ACCEPTED_BOSSKEY_GROUPS = [
    "dungeon",
    "ganon"
];

const DUNGEON_KEY_AMP = {
    "temple_fire": 1,
    "temple_water": 1
};

const cache = new Map();

Logic.addEventListener("change", event => {
    EventBus.trigger("logic", event.data);
});

function augmentDungeonstate(data) {
    const dungeonData = DungeonstateResource.get("area");
    const res = {};
    for (const [ref, dData] of Object.entries(dungeonData)) {
        // augment keys
        if (dData.keys) {
            if (data["option.track_keys"] != null) {
                if (ACCEPTED_KEY_GROUPS.includes(dData.keys_group) && !cache.get("option.track_keys")) {
                    res[dData.keys] = 9999;
                } else if (DUNGEON_KEY_AMP[ref] != null && !cache.get("option.keysanity_small")) {
                    res[dData.keys] = (cache.get(dData.keys) ?? 0) + DUNGEON_KEY_AMP[ref];
                } else {
                    res[dData.keys] = cache.get(dData.keys) ?? 0;
                }
            } else if (data[dData.keys] != null && cache.get("option.track_keys")) {
                if (DUNGEON_KEY_AMP[ref] != null && !cache.get("option.keysanity_small")) {
                    res[dData.keys] = (cache.get(dData.keys) ?? 0) + DUNGEON_KEY_AMP[ref];
                } else {
                    res[dData.keys] = cache.get(dData.keys) ?? 0;
                }
            }
        }
        // augment bosskeys
        if (dData.bosskey) {
            if (data["option.track_bosskeys"] != null) {
                if (ACCEPTED_BOSSKEY_GROUPS.includes(dData.bosskey_group) && !cache.get("option.track_bosskeys")) {
                    res[dData.bosskey] = 9999;
                } else {
                    res[dData.bosskey] = cache.get(dData.bosskey) ?? 0;
                }
            } else if (data[dData.bosskey] != null && cache.get("option.track_bosskeys")) {
                res[dData.bosskey] = cache.get(dData.bosskey) ?? 0;
            }
        }
        // augment dungeontypes
        const dTypeKey = `dungeontype.${ref}`;
        if (dData.hasmq && data[dTypeKey] === "") {
            data[dTypeKey] = "n";
        }
    }
    return {
        ...data,
        ...res
    }
}

function init() {
    const data = {
        ...SavestateHandler.getAll(""),
        ...SavestateHandler.getAll("dungeonstate"),
        ...SettingsStorage.getAll(),
        ...OptionsStorage.getAll(),
        ...FilterStorage.getAll()
    };
    cache.clear();
    for (const [key, value] of Object.entries(data)) {
        cache.set(key, value);
    }
    const augmentedData = augmentDungeonstate(data);
    Logic.reset();
    Logic.execute(augmentedData, "region.root");
}

function onChange(event) {
    const changes = {};
    for (const [key, value] of Object.entries(event.data)) {
        if (cache.get(key) != value) {
            changes[key] = value;
            cache.set(key, value);
        }
    }
    if (Object.keys(changes).length > 0) {
        const augmentedData = augmentDungeonstate(changes);
        Logic.execute(augmentedData, "region.root");
    }
}

class LogicCaller {

    constructor() {
        init();
        /* EVENTS */
        SavestateHandler.addEventListener("load", init);
        SavestateHandler.addEventListener("change", onChange);
        SavestateHandler.addEventListener("change_dungeonstate", onChange);
        OptionsStorage.addEventListener("change", onChange);
        SettingsStorage.addEventListener("change", onChange);
        FilterStorage.addEventListener("change", onChange);
    }

}

export default new LogicCaller();
