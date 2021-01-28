import OptionsStorage from "../../storage/OptionsStorage.js";

const KEY = new WeakMap();

export default class OptionsSpy extends EventTarget {

    constructor(key) {
        super();
        KEY.set(this, key);
        OptionsStorage.addEventListener("change", event => {
            if (event.data[key] != null) {
                const ev = new Event("value");
                ev.data = event.data[key];
                this.dispatchEvent(ev);
            }
        });
    }

    get value() {
        const key = KEY.get(this);
        return OptionsStorage.get(key);
    }

}
