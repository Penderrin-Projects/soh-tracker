const INSTANCES = new Map();
const STORAGE = new WeakMap();
const KEY = new WeakMap();

function getInstance(storage, key) {
    const sInts = INSTANCES.get(storage);
    if (sInts != null) {
        return sInts.get(key);
    }
}

function setInstance(storage, key, inst) {
    const sInts = INSTANCES.get(storage);
    if (sInts != null) {
        sInts.set(key, inst);
    } else {
        const insts = new Map();
        insts.set(key, inst);
        INSTANCES.set(storage, insts);
    }
}

export default class DataStorageObserver extends EventTarget {

    constructor(storage, key) {
        const inst = getInstance(storage, key);
        if (inst != null) {
            return inst;
        }
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
        storage.addEventListener("clear", event => {
            const ev = new Event("change");
            ev.data = null;
            this.dispatchEvent(ev);
        });
        storage.addEventListener("load", event => {
            const key = KEY.get(this);
            if (key != null && event.data[key] != null) {
                const ev = new Event("change");
                ev.data = event.data[key];
                this.dispatchEvent(ev);
            }
        });
        setInstance(storage, key, this);
    }

    set key(value) {
        KEY.set(this, value);
    }

    get key() {
        return KEY.get(this);
    }

    get value() {
        const storage = STORAGE.get(this);
        const key = KEY.get(this);
        if (key != null) {
            return storage.get(key);
        }
    }

}
