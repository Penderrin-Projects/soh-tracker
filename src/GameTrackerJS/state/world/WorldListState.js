import WorldResource from "../../resource/WorldResource.js";

const CONFIG = WorldResource.get("config");
const AREA = new WeakMap();

class WorldListState extends EventTarget {

    constructor() {
        super();
        /* --- */
        AREA.set(this, CONFIG.defaultArea);
    }

    get default() {
        return CONFIG.defaultArea;
    }

    get isDefault() {
        const area = AREA.get(this);
        return area == CONFIG.defaultArea;
    }

    get area() {
        return AREA.get(this);
    }

    set area(value) {
        const old = AREA.get(this);
        if (typeof value != "string" || !value) {
            value = CONFIG.defaultArea;
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
        if (old != CONFIG.defaultArea) {
            AREA.set(this, CONFIG.defaultArea);
            // external
            const ev = new Event("area");
            ev.data = CONFIG.defaultArea;
            this.dispatchEvent(ev);
        }
    }

}

export default new WorldListState();
