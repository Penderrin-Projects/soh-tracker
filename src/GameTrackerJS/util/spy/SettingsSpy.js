import EventBus from "/emcJS/event/EventBus.js";
import SettingsStorage from "/script/storage/SettingsStorage.js";

const KEY = new WeakMap();

export default class SettingsSpy extends EventTarget {

    constructor(key) {
        super();
        KEY.set(this, key);
        EventBus.register("settings", async event => {
            if (event.data[key] != null) {
                const ev = new Event("value");
                ev.data = event.data[key];
                this.dispatchEvent(ev);
            }
        });
    }

    get value() {
        const key = KEY.get(this);
        return SettingsStorage.get(key);
    }

}
