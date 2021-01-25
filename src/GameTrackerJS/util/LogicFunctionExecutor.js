
import SavestateHandler from "../savestate/SavestateHandler.js";
import OptionsStorage from "../storage/OptionsStorage.js";
import SettingsStorage from "../storage/SettingsStorage.js";

const cache = new Map();

function valueGetter(key) {
    return cache.get(key);
}

class LogicFunctionExecutor extends EventTarget {

    constructor() {
        super();
        /* --- */
        const data = {
            ...SavestateHandler.getAll(""),
            ...SettingsStorage.getAll(),
            ...OptionsStorage.getAll()
        };
        for (const [key, value] of Object.entries(data)) {
            cache.set(key, value);
        }
        /* EVENTS */
        SavestateHandler.addEventListener("change", event => {
            for (const [key, value] of Object.entries(event.data)) {
                cache.set(key, value);
            }
            const ev = new Event("change");
            this.dispatchEvent(ev);
        });
        OptionsStorage.addEventListener("change", event => {
            for (const [key, value] of Object.entries(event.data)) {
                cache.set(key, value);
            }
            const ev = new Event("change");
            this.dispatchEvent(ev);
        });
        SettingsStorage.addEventListener("change", event => {
            for (const [key, value] of Object.entries(event.data)) {
                cache.set(key, value);
            }
            const ev = new Event("change");
            this.dispatchEvent(ev);
        });
    }

    execute(fn) {
        if (typeof fn != "function") {
            throw new TypeError(`expected parameter to be of type "function" but was "${typeof fn}"`);
        }
        return !!fn(valueGetter);
    }

}

export default new LogicFunctionExecutor();
