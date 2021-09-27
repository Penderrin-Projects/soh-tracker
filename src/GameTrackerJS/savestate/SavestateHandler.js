// frameworks
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import LocalStorage from "/emcJS/storage/LocalStorage.js";

import Savestate from "./Savestate.js";
import SavestateConverter from "./SavestateConverter.js";
import BusyIndicator from "../ui/BusyIndicator.js";

const PERSISTANCE_NAME = "savestate";
const STATE_DIRTY = "state_dirty";
const TITLE_PREFIX = document.title;

const STORAGE = new IDBStorage("savestates");

function updateTitle() {
    if (!TITLE_PREFIX.startsWith("[D]")) {
        const name = Savestate.name || "new state";
        if (LocalStorage.get(STATE_DIRTY)) {
            document.title = `${TITLE_PREFIX} - ${name} *`;
        } else {
            document.title = `${TITLE_PREFIX} - ${name}`;
        }
    }
}

class SavestateHandler extends EventTarget {

    constructor() {
        super();
        /* --- */
        const initState = LocalStorage.get(PERSISTANCE_NAME);
        if (initState != null) {
            this.dispatchEvent(new Event("beforeload"));
            const state = SavestateConverter.convert(initState);
            Savestate.deserialize(state);
            updateTitle();
            // trigger event
            this.dispatchEvent(new Event("reset"));
            const ev = new Event("load");
            ev.state = state;
            this.dispatchEvent(ev);
            this.dispatchEvent(new Event("afterload"));
        }
        /* --- */
        Savestate.addEventListener("change", event => {
            const state = Savestate.serialize();
            this./*#*/__cacheData(state, true);
            if (!event.category) {
                const ev = new Event("change");
                ev.data = event.data;
                this.dispatchEvent(ev);
            } else {
                const ev = new Event(`change_${event.category}`);
                ev.data = event.data;
                this.dispatchEvent(ev);
            }
        });
        Savestate.addEventListener("notes", event => {
            const state = Savestate.serialize();
            this./*#*/__cacheData(state, true);
            const ev = new Event("notes");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        Savestate.addEventListener("options", event => {
            const state = Savestate.serialize();
            this./*#*/__cacheData(state, true);
        });
        Savestate.addEventListener("filter", event => {
            const state = Savestate.serialize();
            this./*#*/__cacheData(state, true);
        });
        Savestate.addEventListener("startitems", event => {
            const state = Savestate.serialize();
            this./*#*/__cacheData(state, true);
        });
    }

    /*#*/__cacheData(data, dirty = true) {
        LocalStorage.set(PERSISTANCE_NAME, data);
        LocalStorage.set(STATE_DIRTY, !!dirty);
        const ev = new Event("dirty");
        ev.data = !!dirty;
        this.dispatchEvent(ev);
        updateTitle();
    }

    async save(name = Savestate.name) {
        Savestate.name = name;
        const state = Savestate.serialize();
        state.timestamp = new Date();
        state.autosave = false;
        await STORAGE.set(name, state);
        // write state data
        this./*#*/__cacheData(state, false);
    }

    async load(name) {
        await BusyIndicator.busy();
        if (await STORAGE.has(name)) {
            this.dispatchEvent(new Event("beforeload"));
            const state = SavestateConverter.convert(await STORAGE.get(name));
            // write state data
            Savestate.deserialize(state);
            this./*#*/__cacheData(state, false);
            // trigger event
            this.dispatchEvent(new Event("reset"));
            const ev = new Event("load");
            ev.state = state;
            this.dispatchEvent(ev);
            this.dispatchEvent(new Event("afterload"));
        }
        await BusyIndicator.unbusy();
    }

    getName() {
        return Savestate.name;
    }

    isDirty() {
        return LocalStorage.get(STATE_DIRTY);
    }
    
    /**
     * Resets the state and initializes the savestate, options and filter with the given data, handling it as a stateload
     * @param {Object} stateData an Object containing data for savestate, options and filter
     */
    async reset(data = {}) {
        await BusyIndicator.busy();
        this.dispatchEvent(new Event("beforeload"));
        // write state data
        Savestate.deserialize(data);
        // cache data
        const state = Savestate.serialize();
        this./*#*/__cacheData(state, false);
        // trigger event
        this.dispatchEvent(new Event("reset"));
        const ev = new Event("load");
        ev.state = state;
        this.dispatchEvent(ev);
        this.dispatchEvent(new Event("afterload"));
        await BusyIndicator.unbusy();
    }

    /**
     * Overwrites the savestate, options and filter with the given data, handling it as a stateload
     * @param {Object} stateData an Object containing data for savestate, options and filter
     */
    async overwrite(data = {}) {
        await BusyIndicator.busy();
        this.dispatchEvent(new Event("beforeload"));
        // write state data
        Savestate.overwrite(data);
        // cache data
        const state = Savestate.serialize();
        this./*#*/__cacheData(state, true);
        // trigger event
        const ev = new Event("load");
        ev.state = state;
        this.dispatchEvent(ev);
        this.dispatchEvent(new Event("afterload"));
        await BusyIndicator.unbusy();
    }

    /* NOTES */

    setNotes(value) {
        Savestate.notes = value;
    }

    getNotes() {
        return Savestate.notes || "";
    }

    /* DATA */

    getData(category) {
        return Savestate.getData(category);
    }

    set(category, key, value) {
        Savestate.set(category, key, value);
    }

    get(category, key, value) {
        return Savestate.get(category, key, value);
    }

    getAll(category) {
        return Savestate.getAll(category);
    }

    delete(category, key) {
        Savestate.delete(category, key);
    }

    /* additional storages */
    
    get options() {
        return Savestate.options;
    }
    
    get filter() {
        return Savestate.filter;
    }
    
    get startitems() {
        return Savestate.startitems;
    }

    /* debug */
    testConverter() {
        const offset = SavestateConverter.offset;
        const version = SavestateConverter.version;
        console.group("StateConverter - Test");
        try {
            for (let i = offset; i < version; ++i) {
                console.log(`Version[${i}]: `, SavestateConverter.convert({version: i, data: {}}));
            }
        } catch(err) {
            console.error(err);
        } finally {
            console.groupEnd("StateConverter - Test");
        }
    }

}

const savestate = Object.freeze(new SavestateHandler());
window.savestate = savestate;
export default savestate;
