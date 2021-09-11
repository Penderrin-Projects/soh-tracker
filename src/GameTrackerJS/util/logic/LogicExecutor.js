import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import SavestateHandler from "../../savestate/SavestateHandler.js";
import OptionsStorage from "../../savestate/storage/OptionsStorage.js";
import SettingsStorage from "../../storage/SettingsStorage.js";

const STORAGES = {
    // GameTrackerJS
    items: Savestate.getStorage("items"),
    locations: Savestate.getStorage("locations"),
    startItems: Savestate.getStorage("startItems"),
    options: Savestate.getStorage("options"),
    filter: Savestate.getStorage("filter"),
};

const cache = new Map();

function valueGetter(key) {
    return cache.get(key);
}

function renameKeys(src = {}, prefix = "") {
    const res = {};
    for (const [key, value] of Object.entries(src)) {
        res[`${prefix}${key}`] = value;
    }
    return res;
}

function init() {
    const data = {
        ...renameKeys(STORAGES.items.getAll(), "item."),
        ...renameKeys(STORAGES.locations.getAll(), "location."),
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
    const ev = new Event("reset");
    this.dispatchEvent(ev);
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

class LogicExecutor extends EventTarget {

    constructor() {
        super();
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

    execute(fn) {
        if (typeof fn != "function") {
            throw new TypeError(`expected parameter to be of type "function" but was "${typeof fn}"`);
        }
        return !!fn(valueGetter);
    }

}
    
export default new LogicExecutor();
