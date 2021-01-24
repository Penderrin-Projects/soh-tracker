import DataStorage from "../storage/DataStorage.js";
import OptionsStorage from "../storage/OptionsStorage.js";

const DATA = new Map();
let name = "";
let version = 0;
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
    
    serialize() {
        const res = {
            name,
            notes,
            version,
            timestamp,
            autosave,
            options: OptionsStorage.getAll(),
            data: {}
        };
        for (const [category, dataStorage] of DATA) {
            res.data[category] = dataStorage.getAll();
        }
        return res;
    }

    deserialize(value) {
        name = value.name.toString();
        notes = value.notes.toString();
        version = value.version;
        timestamp = value.timestamp;
        autosave = value.autosave;
        OptionsStorage.setAll(value.options ?? {});
        /* --- */
        if (value.data != null) {
            for (const category in value.data) {
                const dataStorage = this.getData(category);
                dataStorage.clear();
                dataStorage.setAll(value.data[category]);
            }
        }
    }

    /* DATA */

    getData(category) {
        const storageCategory = category.toString();
        if (DATA.has(storageCategory)) {
            return DATA.get(storageCategory);
        } else {
            const dataStorage = new DataStorage();
            dataStorage.addEventListener("change", event => {
                setTimeout(() => {
                    const ev = new Event("change");
                    ev.category = storageCategory;
                    ev.data = event.data;
                    this.dispatchEvent(ev);
                }, 0);
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

}

export default new Savestate();
