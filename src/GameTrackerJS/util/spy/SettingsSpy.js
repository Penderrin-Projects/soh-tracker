import SettingsStorage from "../../storage/SettingsStorage.js";

const KEY = new WeakMap();

export default class SettingsSpy extends EventTarget {

    constructor(key) {
        super();
        KEY.set(this, key);
        SettingsStorage.addEventListener("change", event => {
            if (event.data[key] != null) {
                const ev = new Event("value");
                ev.data = event.data[key].value;
                this.dispatchEvent(ev);
            }
        });
    }

    get value() {
        const key = KEY.get(this);
        return SettingsStorage.get(key);
    }

}
