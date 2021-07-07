// frameworks
import EventBus from "/emcJS/event/EventBus.js";

import SettingsResource from "../resource/SettingsResource.js";
import IDBProxyStorage from "./IDBProxyStorage.js";

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
        // TODO check if value is valid; else set default/remove value
        super.set(key, value);
    }

    setAll(values) {
        // TODO check if values are valid; else set default/remove value
        super.setAll(values);
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

    static create(name) {
        return new Promise((resolve, reject) => {
            const resource = new SettingsStorage(name);
            resource.addEventListener("load", () => {
                resolve(resource);
            });
            resource.addEventListener("error", () => {
                resolve(resource);
            });
        });
    }

}

const storage = await SettingsStorage.create();
export default storage;
