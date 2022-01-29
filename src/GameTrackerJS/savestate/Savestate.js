// frameworks
import DataStorage from "/emcJS/datastorage/DataStorage.js";

import VersionData from "../data/VersionData.js";
import OptionsStorage from "../storage/OptionsStorage.js";
import FilterStorage from "../storage/FilterStorage.js";
import StartItemsStorage from "../storage/StartItemsStorage.js";
import SavestateConverter from "./SavestateConverter.js";

const SPECIAL_STORAGES = new Map();
const DATA = new Map();
let name = "";
let version = SavestateConverter.version;
let timestamp = new Date();
let autosave = false;
let notes = "";

class Savestate extends EventTarget {

    constructor() {
        super();
        /* --- */
        OptionsStorage.addEventListener("change", event => {
            const ev = new Event("options");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        FilterStorage.addEventListener("persistedchange", event => {
            const ev = new Event("filter");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        StartItemsStorage.addEventListener("change", event => {
            const ev = new Event("startitems");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
    }

    set name(value) {
        name = value.toString();
    }

    get name() {
        return name;
    }

    set notes(value) {
        value = value.toString();
        if (notes != value) {
            notes = value;
            const ev = new Event("notes");
            ev.data = value;
            this.dispatchEvent(ev);
        }
    }

    get notes() {
        return notes;
    }

    get version() {
        return version;
    }

    get timestamp() {
        return timestamp;
    }

    get autosave() {
        return autosave;
    }

    getStructure() {
        return {
            name,
            notes,
            version,
            timestamp,
            autosave,
            data: {},
            options: {},
            filter: {},
            startitems: {}
        };
    }

    purge() {
        DATA.clear();
        name = "";
        version = SavestateConverter.version;
        timestamp = new Date();
        autosave = false;
        notes = "";
    }

    serialize() {
        const res = {
            name,
            notes,
            version,
            timestamp,
            autosave,
            data: {},
            options: OptionsStorage.serialize(),
            filter: FilterStorage.serialize(),
            startitems: StartItemsStorage.serialize(),
            ["_meta"]: {
                app: VersionData.versionString,
                browser: VersionData.browserData
            }
        };
        for (const [category, dataStorage] of DATA) {
            res.data[category] = dataStorage.serialize();
        }
        return res;
    }

    deserialize({data = {}, options = {}, filter = {}, startitems = {}, ...value} = {}) {
        DATA.clear();
        name = value.name?.toString() ?? "";
        notes = value.notes?.toString() ?? "";
        version = value.version ?? SavestateConverter.version;
        timestamp = value.timestamp ?? new Date();
        autosave = value.autosave ?? false;
        /* --- */
        for (const category in data) {
            const dataStorage = this.getData(category);
            dataStorage.deserialize(data[category]);
        }
        OptionsStorage.deserialize(options);
        FilterStorage.deserialize(filter);
        StartItemsStorage.deserialize(startitems);
    }

    overwrite({data = {}, options = {}, filter = {}, startitems = {}} = {}) {
        for (const category in data) {
            const dataStorage = this.getData(category);
            const buffer = data[category];
            if (buffer == null) {
                dataStorage.clear();
            } else {
                dataStorage.overwrite(data[category]);
            }
        }
        OptionsStorage.overwrite(options);
        FilterStorage.overwrite(filter);
        StartItemsStorage.overwrite(startitems);
    }

    /* DATA */

    getData(category) {
        const storageCategory = category.toString();
        if (DATA.has(storageCategory)) {
            return DATA.get(storageCategory);
        } else {
            const dataStorage = new DataStorage();
            dataStorage.addEventListener("change", event => {
                const ev = new Event("change");
                ev.category = storageCategory;
                ev.data = event.data;
                this.dispatchEvent(ev);
            });
            DATA.set(storageCategory, dataStorage);
            return dataStorage;
        }
    }

    set(category, key, value) {
        const dataStorage = this.getData(category);
        if (typeof key == "object") {
            dataStorage.setAll(key);
        } else {
            dataStorage.set(key, value);
        }
    }

    get(category, key, def) {
        const dataStorage = this.getData(category);
        if (dataStorage.has(key)) {
            return dataStorage.get(key);
        }
        return def;
    }

    getAll(category) {
        if (category == null) {
            const res = {};
            for (const [category, dataStorage] of DATA) {
                res[category] = dataStorage.getAll();
            }
            return res;
        } else {
            const dataStorage = this.getData(category);
            return dataStorage.getAll();
        }
    }

    delete(category, key) {
        const dataStorage = this.getData(category);
        if (dataStorage.has(key)) {
            dataStorage.delete(key);
        }
    }

    /* additional storages */

    registerStorage(name, storage) {
        if (!(storage instanceof DataStorage)) {
            throw new TypeError("unknown storage implementation, expected DataStorage");
        }
        if (SPECIAL_STORAGES.has(name)) {
            throw new Error(`special storage with name "${name}" already registerred`);
        }
        if (DATA.has(name)) {
            storage.deserialize(DATA.get(name).serialize());
            DATA.set(name, storage);
        }
        SPECIAL_STORAGES.set(name, storage);
    }

    getStorage(name) {
        return DATA.get(name) ?? SPECIAL_STORAGES.get(name);
    }

}

export default new Savestate();
