import EventBus from "/emcJS/event/EventBus.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import SettingsResource from "../data/SettingsResource.js";
import DataStorage from "./DataStorage.js";

const SET_TYPES = [
    "list",
    "-list"
];

const DEFAULTS = new Map();
const STORAGE = new IDBStorage("settings");

for (const [key, value] in Object.entries(SettingsResource.get())) {
    if (SET_TYPES.indexOf(value.type) >= 0) {
        const def = new Set(value.default);
        for (const el of value.values) {
            DEFAULTS.set(el, def.has(el));
        }
    } else {
        DEFAULTS.set(key, value.default);
    }
}

class SettingsStorage extends DataStorage {

    constructor() {
        super();
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
        STORAGE.set(key, value);
        super.set(key, value);
    }

    setAll(values) {
        STORAGE.setAll(values);
        super.setAll(values);
    }

    clear() {
        STORAGE.clear();
        super.clear();
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
storage.setAll(await STORAGE.getAll());
export default storage;
