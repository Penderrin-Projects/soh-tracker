const BUFFER = new WeakMap();

export default class DataStorage extends EventTarget {

    constructor(values) {
        super();
        const buffer = new Map();
        BUFFER.set(this, buffer);
        // ---
        for (const key in values) {
            const value = values[key];
            const old = buffer.get(key);
            if (old != value) {
                buffer.set(key, value);
            }
        }
    }

    set(key, value) {
        const buffer = BUFFER.get(this);
        const old = buffer.get(key);
        if (old != value) {
            buffer.set(key, value);
            const ev = new Event("change");
            ev.changes = {[key]: {oldValue: old, newValue: value}};
            ev.data = {[key]: value};
            this.dispatchEvent(ev);
        }
    }

    setAll(values) {
        const buffer = BUFFER.get(this);
        const changes = {};
        const data = {};
        for (const key in values) {
            const value = values[key];
            const old = buffer.get(key);
            if (old != value) {
                buffer.set(key, value);
                changes[key] = {oldValue: old, newValue: value};
                data[key] = value;
            }
        }
        if (Object.keys(changes).length) {
            const ev = new Event("change");
            ev.changes = changes;
            ev.data = data;
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

    delete(key) {
        const buffer = BUFFER.get(this);
        const old = buffer.get(key);
        buffer.delete(key);
        if (typeof old != "undefined") {
            const ev = new Event("change");
            ev.changes = {[key]: {oldValue: old, newValue: undefined}};
            ev.data = {[key]: undefined};
            this.dispatchEvent(ev);
        }
    }

    has(key) {
        const buffer = BUFFER.get(this);
        return buffer.has(key);
    }

    keys() {
        const buffer = BUFFER.get(this);
        return buffer.keys();
    }

    clear() {
        const buffer = BUFFER.get(this);
        buffer.clear();
        const ev = new Event("clear");
        this.dispatchEvent(ev);
    }
    
    serialize() {
        return this.getAll();
    }

    deserialize(data) {
        const buffer = BUFFER.get(this);
        buffer.clear();
        if (data != null) {
            for (const key in data) {
                const value = data[key];
                buffer.set(value);
            }
        }
    }

}
