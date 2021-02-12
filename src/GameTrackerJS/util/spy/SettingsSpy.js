import SettingsStorage from "../../storage/SettingsStorage.js";

const KEY = new WeakMap();

export default class SettingsSpy extends EventTarget {

    constructor(key) {
        super();
        KEY.set(this, key);
        SettingsStorage.addEventListener("change", event => {
            if (event.data[key] != null) {
                const ev = new Event("change");
                ev.data = event.data[key];
                ev.change = event.changes[key];
                this.dispatchEvent(ev);
            }
        });
    }

    get value() {
        const key = KEY.get(this);
        return SettingsStorage.get(key);
    }

}
