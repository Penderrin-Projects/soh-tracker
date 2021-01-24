import FileData from "/emcJS/data/FileData.js";
import EventBus from "/emcJS/event/EventBus.js";
import DataStorage from "./DataStorage.js";

const SET_TYPES = [
    "list",
    "-list"
];

const DEFAULTS = new Map();

class OptionsStorage extends DataStorage {

    constructor() {
        super();
        this.addEventListener("change", event => {
            const data = {};
            for (const [key, value] of Object.entries(event.data)) {
                data[key] = value.value;
            }
            EventBus.trigger("randomizer_options", data);
        });
        EventBus.register("randomizer_options", event => {
            this.setAll(event.data);
        });
    }

    async init() {
        const options = FileData.get("options", {});
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
        return super.get(key, value);
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

}

export default new OptionsStorage();
