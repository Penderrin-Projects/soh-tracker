import Savestate from "/GameTrackerJS/savestate/Savestate.js";
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

function initItemValues() {
    const itemData = STORAGES.items.getAll();
    const startItemData = STORAGES.items.getAll();
    const res = {};
    for (const [key, value] of Object.entries(itemData)) {
        const startValue = startItemData[key];
        if (startValue != null) {
            res[key] = Math.max(startValue, value);
        } else {
            res[key] = value;
        }
    }
    for (const [key, value] of Object.entries(startItemData)) {
        if (res[key] == null) {
            const startValue = itemData[key];
            if (startValue != null) {
                res[key] = Math.max(startValue, value);
            } else {
                res[key] = value;
            }
        }
    }
    return res;
}

function augmentItemValues(newData) {
    const res = {};
    for (const [key, value] of Object.entries(newData)) {
        const startValue = STORAGES.startItems.get(key);
        if (startValue != null) {
            res[key] = Math.max(startValue, value);
        } else {
            res[key] = value;
        }
    }
    return res;
}

function augmentStartItemValues(newData) {
    const res = {};
    for (const [key, startValue] of Object.entries(newData)) {
        const value = STORAGES.items.get(key);
        if (startValue != null) {
            res[key] = Math.max(startValue, value);
        } else {
            res[key] = startValue;
        }
    }
    return res;
}

class LogicExecutor extends EventTarget {

    constructor() {
        super();
        this./*#*/__init();
        /* EVENTS */
        Savestate.addEventListener("load", () => {
            this./*#*/__init();
        });
        STORAGES.items.addEventListener("change", (event) => {
            this./*#*/__changeData(renameKeys(augmentItemValues(event.data), "item."));
        });
        STORAGES.startItems.addEventListener("change", (event) => {
            this./*#*/__changeData(renameKeys(augmentStartItemValues(event.data), "item."));
        });
        STORAGES.locations.addEventListener("change", (event) => {
            this./*#*/__changeData(renameKeys(event.data, "location."));
        });
        STORAGES.options.addEventListener("change", (event) => {
            this./*#*/__changeData(event.data);
        });
        STORAGES.filter.addEventListener("change", (event) => {
            this./*#*/__changeData(event.data);
        });
        SettingsStorage.addEventListener("change", (event) => {
            this./*#*/__changeData(event.data);
        });
    }

    /*#*/__init() {
        const data = {
            ...renameKeys(initItemValues(), "item."),
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

    /*#*/__changeData(newData) {
        const changes = {};
        for (const [key, value] of Object.entries(newData)) {
            const oldValue = cache.get(key);
            if (oldValue != value) {
                changes[key] = value;
                cache.set(key, value);
            }
        }
        if (Object.keys(changes).length > 0) {
            const ev = new Event("change");
            this.dispatchEvent(ev);
        }
    }

    execute(fn) {
        if (typeof fn != "function") {
            throw new TypeError(`expected parameter to be of type "function" but was "${typeof fn}"`);
        }
        return !!fn(valueGetter);
    }

}
    
export default new LogicExecutor();
