const BUFFER = new WeakMap();

export default class Observable extends EventTarget {

    constructor(values) {
        super();
        const buffer = new Map();
        BUFFER.set(this, buffer);
        // ---
        for (const key in values) {
            const value = values[key];
            buffer.set(key, value);
        }
    }

    set(key, value) {
        const buffer = BUFFER.get(this);
        const old = buffer.get(key);
        if (old != value) {
            buffer.set(key, value);
            const ev = new Event(key);
            ev.value = value;
            this.dispatchEvent(ev);
        }
    }

    get(key, value) {
        const buffer = BUFFER.get(this);
        return buffer.get(key) ?? value;
    }

}
