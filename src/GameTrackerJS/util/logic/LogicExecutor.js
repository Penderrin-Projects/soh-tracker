import SavestateHandler from "../../savestate/SavestateHandler.js";
import OptionsStorage from "../../storage/OptionsStorage.js";
import SettingsStorage from "../../storage/SettingsStorage.js";

const cache = new Map();

function valueGetter(key) {
    return cache.get(key);
}

function init() {
    const data = {
        ...SavestateHandler.getAll(""),
        ...SettingsStorage.getAll(),
        ...OptionsStorage.getAll()
    };
    cache.clear();
    for (const [key, value] of Object.entries(data)) {
        cache.set(key, value);
    }
    const ev = new Event("reset");
    this.dispatchEvent(ev);
}

function onChange(event) {
    const changes = {};
    for (const [key, value] of Object.entries(event.data)) {
        if (cache.get(key) != value) {
            changes[key] = value;
            cache.set(key, value);
        }
    }
    if (Object.keys(changes).length > 0) {
        const ev = new Event("change");
        this.dispatchEvent(ev);
    }
}

class LogicExecutor extends EventTarget {

    constructor() {
        super();
        const iInit = init.bind(this);
        const iOnChange = onChange.bind(this);
        /* --- */
        iInit();
        /* EVENTS */
        SavestateHandler.addEventListener("load", iInit);
        SavestateHandler.addEventListener("change", iOnChange);
        OptionsStorage.addEventListener("change", iOnChange);
        SettingsStorage.addEventListener("change", iOnChange);
    }

    execute(fn) {
        if (typeof fn != "function") {
            throw new TypeError(`expected parameter to be of type "function" but was "${typeof fn}"`);
        }
        return !!fn(valueGetter);
    }

}
    
export default new LogicExecutor();
