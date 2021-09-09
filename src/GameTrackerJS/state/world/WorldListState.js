import WorldResource from "../../resource/WorldResource.js";

const CONFIG = WorldResource.get("config");
const DEFAULT_AREA = `area/${CONFIG.defaultArea}`;
const AREA = new WeakMap();

class WorldListState extends EventTarget {

    constructor() {
        super();
        /* --- */
        AREA.set(this, DEFAULT_AREA);
    }

    get default() {
        return DEFAULT_AREA;
    }

    get isDefault() {
        const area = AREA.get(this);
        return area == DEFAULT_AREA;
    }

    get area() {
        return AREA.get(this);
    }

    set area(value) {
        const old = AREA.get(this);
        if (typeof value != "string" || !value) {
            value = DEFAULT_AREA;
        }
        if (old != value) {
            AREA.set(this, value);
            // external
            const ev = new Event("area");
            ev.data = value;
            this.dispatchEvent(ev);
        }
    }

    reset() {
        const old = AREA.get(this);
        if (old != DEFAULT_AREA) {
            AREA.set(this, DEFAULT_AREA);
            // external
            const ev = new Event("area");
            ev.data = DEFAULT_AREA;
            this.dispatchEvent(ev);
        }
    }

}

export default new WorldListState();
