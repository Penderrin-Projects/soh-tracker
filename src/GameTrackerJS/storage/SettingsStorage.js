// frameworks
import EventBus from "/emcJS/event/EventBus.js";
import IDBProxyStorage from "/emcJS/storage/IDBProxyStorage.js";

import SettingsResource from "../resource/SettingsResource.js";

const SET_TYPES = [
    "list",
    "-list"
];

const DEFAULTS = new Map();

for (const [key, value] of Object.entries(SettingsResource.get())) {
    if (SET_TYPES.indexOf(value.type) >= 0) {
        const def = new Set(value.default);
        for (const el of value.values) {
            DEFAULTS.set(el, def.has(el));
        }
    } else {
        DEFAULTS.set(key, value.default);
    }
}

class SettingsStorage extends IDBProxyStorage {

    constructor() {
        super("settings");
        this.addEventListener("change", event => {
            setTimeout(() => {
                EventBus.trigger("settings", event.data);
            }, 0);
        });
        EventBus.register("settings", event => {
            this.setAll(event.data);
        });
    }

    set(key, value) {
        if (DEFAULTS.has(key)) {
            super.set(key, value);
        }
    }

    setAll(values) {
        const res = {};
        for (const key in values) {
            const value = values[key];
            if (DEFAULTS.has(key)) {
                res[key] = value;
            }
        }
        super.setAll(res);
    }

    get(key, value = DEFAULTS.get(key)) {
        if (DEFAULTS.has(key)) {
            return super.get(key, value);
        }
        return value;
    }

    getAll() {
        const res = {};
        for (const [key, value] of DEFAULTS) {
            res[key] = super.get(key, value);
        }
        return res;
    }

    has(key) {
        return DEFAULTS.has(key);
    }

    keys() {
        return DEFAULTS.keys();
    }

}

const storage = new SettingsStorage();
export default await storage.awaitLoaded();
