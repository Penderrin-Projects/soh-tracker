// frameworks
import EventBus from "/emcJS/event/EventBus.js";

// GameTrackerJS
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";
import Logic from "/GameTrackerJS/util/logic/Logic.js";
// Track-OOT
import DungeonstateResource from "/script/resource/DungeonstateResource.js";

const STORAGES = {
    // GameTrackerJS
    items: Savestate.getStorage("items"),
    locations: Savestate.getStorage("locations"),
    startItems: Savestate.getStorage("startItems"),
    options: Savestate.getStorage("options"),
    filter: Savestate.getStorage("filter"),
    // Track-OOT
    dungeonTypes: Savestate.getStorage("dungeonTypes"),
};

/**
 * resources
 * logic augmentation: /ItemPool.py
 */

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

const KEY_VNL_AUGMENTS = {
    "v": {
        "temple_fire": 1
    },
    "mq": {
        "temple_spirit": 3
    }
};
const KEY_SAN_AUGMENTS = {};

const cache = new Map();

function getDungeonType(type, hasmq) {
    if (hasmq) {
        if (type == "v" || type == "mq") {
            return type;
        }
        return "n";
    }
    return "v";
}

function renameKeys(src = {}, prefix = "") {
    const res = {};
    for (const [key, value] of Object.entries(src)) {
        res[`${prefix}${key}`] = value;
    }
    return res;
}

function augmentKeys(ref, type, keys, group) {
    if (ACCEPTED_KEY_GROUPS.includes(group) && !cache.get("option.track_keys")) {
        return 9999;
    }
    const ks = cache.get("option.keysanity_small");
    const aug = !ks ? KEY_VNL_AUGMENTS : KEY_SAN_AUGMENTS;
    if (!type || type == "n") {
        const vAug = aug["v"]?.[ref] ?? 0;
        const mqAug = aug["mq"]?.[ref] ?? 0;
        return keys + Math.max(vAug, mqAug);
    }
    return keys + (aug[type]?.[ref] ?? 0);
}

function augmentBossKeys(keys, group) {
    if (ACCEPTED_BOSSKEY_GROUPS.includes(group) && !cache.get("option.track_bosskeys")) {
        return 9999;
    }
    return keys;
}

Logic.addEventListener("change", event => {
    EventBus.trigger("logic", event.data);
});

function augmentData(data) {
    const dungeonData = DungeonstateResource.get();
    const res = {};
    for (const [ref, dData] of Object.entries(dungeonData)) {
        // augment dungeontypes
        const dTypeKey = `dungeontype.${ref}`;
        if (data[dTypeKey] != null) {
            res[dTypeKey] = getDungeonType(data[dTypeKey], dData.hasmq);
        }
        // augment keys
        if (dData.keys) {
            if (data["option.track_keys"] != null || data[dData.keys] != null || data[dTypeKey] != null) {
                const augKeys = augmentKeys(ref, res[dTypeKey] ?? getDungeonType(cache.get(dTypeKey), dData.hasmq), cache.get(dData.keys) ?? 0, dData.keys_group);
                res[dData.keys] = augKeys;
            }
        }
        // augment bosskeys
        if (dData.bosskey) {
            if (data["option.track_bosskeys"] != null || data[dData.bosskey] != null) {
                const augKeys = augmentBossKeys(cache.get(dData.bosskey) ?? 0, dData.bosskey_group);
                res[dData.bosskey] = augKeys;
            }
        }
    }
    // special augments
    if (data["item.zora_letter"] != null || data["option.doors_open_zora"] != null) {
        if ((data["option.doors_open_zora"] ?? cache.get("option.doors_open_zora")) == "doors_open_zora_both") {
            res["item.zora_letter"] = 1;
        } else {
            res["item.zora_letter"] = data["item.zora_letter"] ?? cache.get("item.zora_letter")
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
        ...renameKeys(STORAGES.items.getAll(), "item."),
        ...renameKeys(STORAGES.locations.getAll(), "location."),
        ...renameKeys(STORAGES.dungeonTypes.getAll(), "dungeontype."),
        ...STORAGES.options.getAll(),
        ...STORAGES.filter.getAll(),
        ...SettingsStorage.getAll(),
    };
    // startitems
    const startItems = STORAGES.startItems.getAll();
    for (const [key, value] of Object.entries(startItems)) {
        if (data[key] == null || data[key] < value) {
            data[key] = value;
        }
    }
    // ---
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
        const oldValue = cache.get(key);
        if (oldValue != value) {
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

function changeItemData(newData) {
    const changes = {};
    for (const [key, value] of Object.entries(newData)) {
        const oldValue = cache.get(key);
        const startValue = STORAGES.startItems.get(key);
        if (startValue != null && startValue > value) {
            if (oldValue!= startValue) {
                changes[key] = startValue;
                cache.set(key, startValue);
            }
        } else if (oldValue != value) {
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

function changeStartitemData(newData) {
    const changes = {};
    for (const [key, startValue] of Object.entries(newData)) {
        const oldValue = cache.get(key);
        const value = STORAGES.items.get(key);
        if (value != null && startValue < value) {
            if (oldValue != value) {
                changes[key] = value;
                cache.set(key, value);
            }
        } else if (oldValue != startValue) {
            changes[key] = startValue;
            cache.set(key, startValue);
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
        Savestate.addEventListener("load", () => {
            init();
        });
        STORAGES.items.addEventListener("change", (event) => {
            changeItemData(renameKeys(event.data, "item."));
        });
        STORAGES.startItems.addEventListener("change", (event) => {
            changeStartitemData(renameKeys(event.data, "item."));
        });
        STORAGES.locations.addEventListener("change", (event) => {
            changeData(renameKeys(event.data, "location."));
        });
        STORAGES.dungeonTypes.addEventListener("change", (event) => {
            changeData(renameKeys(event.data, "dungeontype."));
        });
        STORAGES.options.addEventListener("change", (event) => {
            changeData(event.data);
        });
        STORAGES.filter.addEventListener("change", (event) => {
            changeData(event.data);
        });
        SettingsStorage.addEventListener("change", (event) => {
            changeData(event.data);
        });
    }

}

export default new LogicCaller();
