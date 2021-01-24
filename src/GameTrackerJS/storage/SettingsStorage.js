import FileData from "/emcJS/data/FileData.js";
import IDBProxyStorage from "./IDBProxyStorage.js";

const SET_TYPES = [
    "list",
    "-list"
];

const DEFAULTS = new Map();

class SettingsStorage extends IDBProxyStorage {

    constructor() {
        super("settings");
    }

    async init() {
        await super.init();
        /* --- */
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
