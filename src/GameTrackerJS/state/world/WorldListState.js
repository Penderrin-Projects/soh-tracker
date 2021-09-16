import WorldResource from "../../resource/WorldResource.js";

const CONFIG = WorldResource.get("config");
const AREA_PROPS = WorldResource.get("area");
const AREA = new WeakMap();
const PROPS = new WeakMap();

class WorldListState extends EventTarget {

    constructor() {
        super();
        /* --- */
        AREA.set(this, CONFIG.defaultArea);
    }

    get default() {
        return CONFIG.defaultArea;
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
            PROPS.set(this, AREA_PROPS[value]);
            // external
            const ev = new Event("area");
            ev.data = value;
            this.dispatchEvent(ev);
        }
    }

    get isDefault() {
        const area = AREA.get(this);
        return area == CONFIG.defaultArea;
    }

    get hasMap() {
        const props = PROPS.get(this);
        return props.map.active;
    }

    reset() {
        const old = AREA.get(this);
        if (old != CONFIG.defaultArea) {
            AREA.set(this, CONFIG.defaultArea);
            PROPS.set(this, AREA_PROPS[CONFIG.defaultArea]);
            // external
            const ev = new Event("area");
            ev.data = CONFIG.defaultArea;
            this.dispatchEvent(ev);
        }
    }

    forceReload() {
        this.dispatchEvent(new Event("reload"));
    }

}

export default new WorldListState();
