import FileData from "/emcJS/data/FileData.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";

const STORAGE = new IDBStorage('settings');
const DATA = new Map();
const DEFAULTS = new Map();

class SettingsStorage {

    async init() {
        const data = await STORAGE.getAll();
        for (const key in data) {
            const value = data[key];
            DATA.set(key, value);
        }
        const options = FileData.get("settings", {});
        for (const key in options) {
            const opt = options[key];
            if (opt.type === "list" || opt.type === "-list") {
                const def = new Set(opt.default);
                for (const el of opt.values) {
                    DEFAULTS[el] = def.has(el);
                }
            } else {
                DEFAULTS[key] = opt.default;
            }
        }
    }

    set(key, value) {
        DATA.set(key, value);
        STORAGE.set(key, value);
    }

    get(key, value = DEFAULTS[key]) {
        return DATA.get(key) ?? value;
    }

}

export default new SettingsStorage();
