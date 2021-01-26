import FileData from "/emcJS/data/FileData.js";
import EventBus from "/emcJS/event/EventBus.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import DataStorage from "./DataStorage.js";

const SET_TYPES = [
    "list",
    "-list"
];
    
const DEFAULTS = new Map();
const STORAGE = new IDBStorage("settings");

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

    async init() {
        const options = FileData.get("settings", {});
        for (const key in options) {
            const opt = options[key];
            if (SET_TYPES.indexOf(opt.type) >= 0) {
                const def = new Set(opt.default);
                for (const el of opt.values) {
                    DEFAULTS.set(el, def.has(el));
                }
            } else {
                DEFAULTS.set(key, opt.default);
            }
        }
        // ---
        const data = await STORAGE.getAll();
        super.setAll(data);
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

export default new SettingsStorage();
