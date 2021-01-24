const BUFFER = new WeakMap();

export default class DataStorage extends EventTarget {

    constructor() {
        super();
        BUFFER.set(this, new Map());
    }

    set(key, value) {
        const buffer = BUFFER.get(this);
        buffer.set(key, value);
        const ev = new Event("change");
        ev.data = {[key]: value};
        this.dispatchEvent(ev);
    }

    setAll(values) {
        const buffer = BUFFER.get(this);
        const changes = {};
        for (const key in values) {
            const value = values[key];
            if (buffer.get(key) != value) {
                buffer.set(key, value);
                changes[key] = value;
            }
        }
        if (Object.keys(changes).length) {
            const ev = new Event("change");
            ev.data = changes;
            this.dispatchEvent(ev);
        }
    }

    get(key, value) {
        const buffer = BUFFER.get(this);
        return buffer.get(key) ?? value;
    }

    getAll() {
        const buffer = BUFFER.get(this);
        const res = {};
        for (const [key, value] of buffer) {
            res[key] = value;
        }
        return res;
    }

    has(key) {
        const buffer = BUFFER.get(this);
        return buffer.has(key);
    }

    clear() {
        const buffer = BUFFER.get(this);
        buffer.clear();
        const ev = new Event("clear");
        this.dispatchEvent(ev);
    }

}
