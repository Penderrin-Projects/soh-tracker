/* asym-import: off */
import EventBus from "/emcJS/event/EventBus.js";
/* asym-import: on */
import FilterResource from "../resource/FilterResource.js";
import DataStorage from "./DataStorage.js";

const DEFAULTS = new Map();

for (const [key, value] of Object.entries(FilterResource.get())) {
    DEFAULTS.set(key, value.default);
}

class FilterStorage extends DataStorage {

    constructor() {
        super();
        this.addEventListener("change", event => {
            setTimeout(() => {
                EventBus.trigger("filter", event.data);
            }, 0);
        });
        EventBus.register("filter", event => {
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

}

const storage = new FilterStorage();
export default storage;
