// frameworks
import EventBus from "/emcJS/event/EventBus.js";
import DataStorage from "/emcJS/datastorage/DataStorage.js";

import FilterResource from "../resource/FilterResource.js";

const DEFAULTS = new Map();
const PERSISTED = new Set();

for (const [key, value] of Object.entries(FilterResource.get())) {
    DEFAULTS.set(key, value.default);
    if (value.persist) {
        PERSISTED.add(key);
    }
}

let debounce_timeout = null;
let debounce_data = {};

class FilterStorage extends DataStorage {

    constructor() {
        super();
        this.addEventListener("change", event => {
            if (debounce_timeout != null) {
                clearTimeout(debounce_timeout);
            }
            for (const [key, value] of Object.entries(event.data)) {
                debounce_data[key] = value;
            }
            debounce_timeout = setTimeout(() => {
                EventBus.trigger("filter", debounce_data);
                debounce_data = {};
            }, 100);
            const data = {};
            const changes = {};
            for (const key in event.changes) {
                if (PERSISTED.has(key)) {
                    data[key] = event.data[key];
                    changes[key] = event.changes[key];
                }
            }
            if (Object.keys(changes).length) {
                const ev = new Event("persistedchange");
                ev.data = data;
                ev.changes = changes;
                this.dispatchEvent(ev);
            }
        });
        EventBus.register("filter", event => {
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

    get(key) {
        if (DEFAULTS.has(key)) {
            return super.get(key, DEFAULTS.get(key));
        }
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
    
    serialize() {
        const res = {};
        for (const key of PERSISTED) {
            res[key] = super.get(key, DEFAULTS.get(key));
        }
        return res;
    }

    deserialize(data = {}) {
        const res = {};
        for (const [key] of DEFAULTS) {
            if (PERSISTED.has(key)) {
                const newValue = data[key];
                if (newValue != null) {
                    res[key] = newValue;
                }
            } else {
                const newValue = super.get(key);
                if (newValue != null) {
                    res[key] = newValue;
                }
            }
        }
        super.deserialize(res);
    }

    overwrite(data = {}) {
        const res = {};
        for (const [key] of DEFAULTS) {
            const newValue = data[key];
            res[key] = newValue;
        }
        super.overwrite(res);
    }

}

const storage = new FilterStorage();
export default storage;
