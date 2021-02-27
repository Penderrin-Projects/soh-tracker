import OptionsStorage from "../../storage/OptionsStorage.js";

const STORAGE = new WeakMap();
const KEY = new WeakMap();

export default class DataStorageSpy extends EventTarget {

    constructor(storage, key) {
        super();
        KEY.set(this, key);
        STORAGE.set(this, storage);
        storage.addEventListener("change", event => {
            const key = KEY.get(this);
            if (key != null && event.data[key] != null) {
                const ev = new Event("change");
                ev.data = event.data[key];
                ev.change = event.changes[key];
                this.dispatchEvent(ev);
            }
        });
        storage.addEventListener("reset", event => {
            const key = KEY.get(this);
            if (key != null && event.data[key] != null) {
                const ev = new Event("change");
                ev.data = event.data[key];
                this.dispatchEvent(ev);
            }
        });
    }

    setKey(value) {
        KEY.set(this, value);
    }

    getKey() {
        return KEY.get(this);
    }

    getValue() {
        const storage = STORAGE.get(this);
        const key = KEY.get(this);
        if (key != null) {
            return storage.get(key);
        }
    }

}
