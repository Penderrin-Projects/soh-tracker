// frameworks
import EventBus from "/emcJS/event/EventBus.js";


// GameTrackerJS
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import OptionsStorage from "/GameTrackerJS/storage/OptionsStorage.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";
import FilterStorage from "/GameTrackerJS/storage/FilterStorage.js";
import Logic from "/GameTrackerJS/util/logic/Logic.js";
// Track-OOT
import DungeonstateResource from "/script/resource/DungeonstateResource.js";

/**
 * resources
 * logic augmentation: /ItemPool.py
 */

// TODO differenciate between vanilla keys and mq keys
// for example write keys to ${ref}_v and ${ref}_mq to reflect each type
// TODO change key options to have different values
// keysy, vanilla, own dungeon, overworld only, any dungeon, keysanity

const ACCEPTED_KEY_GROUPS = [
    "dungeon",
    "gerudo",
    "ganon"
];

const ACCEPTED_BOSSKEY_GROUPS = [
    "dungeon",
    "ganon"
];

const cache = new Map();

function renameKeys(src = {}, prefix = "") {
    const res = {};
    for (const [key, value] of Object.entries(src)) {
        res[`${prefix}${key}`] = value;
    }
    return res;
}

function augmentKeys(ref, type, keys) {
    if (!cache.get("option.keysanity_small")) {
        if (ref == "temple_spirit" && type == "mq") {
            return keys + 3;
        }
        if (ref == "temple_fire" && type == "v") {
            return keys + 1;
        }
    } else {
        // nothing
    }
    if (ref == "temple_water" && type == "v") {
        return keys + 1;
    }
    return keys;
}

Logic.addEventListener("change", event => {
    EventBus.trigger("logic", event.data);
});

function augmentData(data) {
    const dungeonData = DungeonstateResource.get("area");
    const res = {};
    for (const [ref, dData] of Object.entries(dungeonData)) {
        // augment dungeontypes
        let updateKeys = false;
        const dTypeKey = `dungeontype.area/${ref}`;
        if (data[dTypeKey] != null) {
            updateKeys = true;
            if (dData.hasmq) {
                if (data[dTypeKey] === "") {
                    res[dTypeKey] = "n";
                } else {
                    res[dTypeKey] = data[dTypeKey];
                }
            } else {
                res[dTypeKey] = "v";
            }
        }
        // augment keys
        if (dData.keys) {
            if (data["option.track_keys"] != null) {
                if (ACCEPTED_KEY_GROUPS.includes(dData.keys_group) && !cache.get("option.track_keys")) {
                    res[dData.keys] = 9999;
                    updateKeys = false;
                } else {
                    updateKeys = true;
                }
            } else if (data[dData.keys] != null) {
                updateKeys = true;
            }
            if (updateKeys) {
                res[dData.keys] = augmentKeys(ref, res[dTypeKey] ?? cache.get(dTypeKey), cache.get(dData.keys) ?? 0);
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
    }
    // ---
    return {
        ...data,
        ...res
    }
}

function augmentReachables(data) {
    // augment epona
    if (data["option.skip_epona_race"] != null) {
        if (data["option.skip_epona_race"]) {
            Logic.addReachable("event.epona");
        } else {
            Logic.deleteReachable("event.epona");
        }
    }
}

function init() {
    const data = {
        ...SavestateHandler.getAll(""),
        ...renameKeys(SavestateHandler.getAll("dungeontype"), "dungeontype."),
        ...SettingsStorage.getAll(),
        ...OptionsStorage.getAll(),
        ...FilterStorage.getAll()
    };
    cache.clear();
    for (const [key, value] of Object.entries(data)) {
        cache.set(key, value);
    }
    const augmentedData = augmentData(data);
    Logic.reset();
    augmentReachables(augmentedData);
    Logic.execute(augmentedData, "region.root");
}

function changeData(newData) {
    const changes = {};
    for (const [key, value] of Object.entries(newData)) {
        if (cache.get(key) != value) {
            changes[key] = value;
            cache.set(key, value);
        }
    }
    if (Object.keys(changes).length > 0) {
        const augmentedData = augmentData(changes);
        augmentReachables(augmentedData);
        Logic.execute(augmentedData, "region.root");
    }
}

class LogicCaller {

    constructor() {
        init();
        /* EVENTS */
        SavestateHandler.addEventListener("load",               event => init());
        SavestateHandler.addEventListener("change",             event => changeData(event.data));
        SavestateHandler.addEventListener("change_dungeontype", event => changeData(renameKeys(event.data, "dungeontype.")));
        OptionsStorage  .addEventListener("change",             event => changeData(event.data));
        SettingsStorage .addEventListener("change",             event => changeData(event.data));
        FilterStorage   .addEventListener("change",             event => changeData(event.data));
    }

}

export default new LogicCaller();
