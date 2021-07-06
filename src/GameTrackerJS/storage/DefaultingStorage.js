/* asym-import: on */
import DataStorage from "./DataStorage.js";

const BUFFER = new WeakMap();

export default class DefaultingStorage extends DataStorage {

    constructor() {
        super();
        const buffer = new Map();
        BUFFER.set(this, buffer);
    }

    setDefault(key, value) {
        const buffer = BUFFER.get(this);
        const old = buffer.get(key);
        if (old != value) {
            buffer.set(key, value);
            if (!super.has(key)) {
                const ev = new Event("change");
                ev.changes = {[key]: {oldValue: this.get(key), newValue: value}};
                ev.data = {[key]: value};
                this.dispatchEvent(ev);
            }
        }
    }

    set(key, value) {
        const buffer = BUFFER.get(this);
        if (buffer.has(key)) {
            super.set(key, value);
        }
    }

    setAll(values) {
        const buffer = BUFFER.get(this);
        const res = {};
        for (const key in values) {
            const value = values[key];
            if (buffer.has(key)) {
                res[key] = value;
            }
        }
        super.setAll(res);
    }

    get(key) {
        const buffer = BUFFER.get(this);
        return super.get(key, buffer.get(key));
    }

    getAll() {
        const buffer = BUFFER.get(this);
        const res = {};
        for (const [key, value] of buffer) {
            res[key] = super.get(key, value);
        }
        return res;
    }

    has(key) {
        const buffer = BUFFER.get(this);
        return buffer.has(key);
    }

    keys() {
        const buffer = BUFFER.get(this);
        return buffer.keys();
    }

    overwrite(values) {
        const buffer = BUFFER.get(this);
        const res = {};
        for (const [key, value] of buffer) {
            res[key] = values[key] ?? value;
        }
        super.setAll(res);
    }

}
