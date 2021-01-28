import EventBus from "/emcJS/event/EventBus.js";
import OptionsResource from "../data/OptionsResource.js";
import DataStorage from "./DataStorage.js";

const SET_TYPES = [
    "list",
    "-list"
];

const DEFAULTS = new Map();

for (const [key, value] of Object.entries(OptionsResource.get())) {
    if (SET_TYPES.indexOf(value.type) >= 0) {
        const def = new Set(value.default);
        for (const el of value.values) {
            DEFAULTS.set(el, def.has(el));
        }
    } else {
        DEFAULTS.set(key, value.default);
    }
}

class OptionsStorage extends DataStorage {

    constructor() {
        super();
        this.addEventListener("change", event => {
            setTimeout(() => {
                EventBus.trigger("options", event.data);
            }, 0);
        });
        EventBus.register("options", event => {
            this.setAll(event.data);
        });
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

const storage = new OptionsStorage();
export default storage;
