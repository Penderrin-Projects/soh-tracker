import IDBStorage from "/emcJS/storage/IDBStorage.js";
import LocalStorage from "/emcJS/storage/LocalStorage.js";
import DateUtil from "/emcJS/util/DateUtil.js";
import Savestate from "./Savestate.js";
import SavestateConverter from "./SavestateConverter.js";

const PERSISTANCE_NAME = "savestate";
const STATE_DIRTY = "state_dirty";
const TITLE_PREFIX = document.title;

const STORAGE = new IDBStorage("savestates");

let autosaveMax = 0;
let autosaveTime = 0;
let autosaveTimeout = null;

function cacheData(data, dirty = true) {
    LocalStorage.set(PERSISTANCE_NAME, data);
    LocalStorage.set(STATE_DIRTY, !!dirty);
    updateTitle();
}

function sortStates(a, b) {
    if (a < b) {
        return 1;
    } else if (a > b) {
        return -1;
    } else {
        return 0;
    }
}

async function removeOverflowAutosaves() {
    const saves = await STORAGE.getAll();
    const keys = Object.keys(saves);
    const autoKeys = [];
    for (const key of keys) {
        if (saves[key].autosave) {
            autoKeys.push(key);
        }
    }
    autoKeys.sort(sortStates);
    while (autoKeys.length >= autosaveMax) {
        const key = autoKeys.pop();
        if (saves[key].autosave) {
            await STORAGE.delete(key);
        }
    }
}

async function autosave() {
    if (LocalStorage.get(STATE_DIRTY, false)) {
        const tmp = Object.assign({}, Savestate.serialize());
        tmp.timestamp = new Date();
        tmp.autosave = true;
        await STORAGE.set(`${DateUtil.convert(new Date(tmp.timestamp), "YMDhms")}_${tmp.name}`, tmp);
        await removeOverflowAutosaves();
    }
    autosaveTimeout = setTimeout(autosave, autosaveTime);
}

function updateTitle() {
    const name = Savestate.name || "new state";
    if (LocalStorage.get(STATE_DIRTY)) {
        document.title = `${TITLE_PREFIX} - ${name} *`;
    } else {
        document.title = `${TITLE_PREFIX} - ${name}`;
    }
}

class SavestateHandler extends EventTarget {

    constructor() {
        super();
        /* --- */
        const initState = LocalStorage.get(PERSISTANCE_NAME);
        if (initState != null) {
            const state = SavestateConverter.convert(initState);
            Savestate.deserialize(state);
            updateTitle();
            // trigger event
            const ev = new Event("state");
            ev.data = {
                notes: state.notes,
                data: state.data,
                options: state.options
            };
            this.dispatchEvent(ev);
        }
        /* --- */
        Savestate.addEventListener("change", event => {
            const state = Savestate.serialize();
            cacheData(state, true);
            if (!event.category) {
                const ev = new Event("change");
                ev.data = event.data;
                ev.changes = event.changes;
                this.dispatchEvent(ev);
            } else {
                const ev = new Event(`change_${event.category}`);
                ev.data = event.data;
                ev.changes = event.changes;
                this.dispatchEvent(ev);
            }
        });
        Savestate.addEventListener("notes", event => {
            const state = Savestate.serialize();
            cacheData(state, true);
            const ev = new Event("notes");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        Savestate.addEventListener("options", event => {
            const state = Savestate.serialize();
            cacheData(state, true);
        });
    }

    async save(name = Savestate.name) {
        Savestate.name = name;
        const state = Savestate.serialize();
        state.timestamp = new Date();
        state.autosave = false;
        await STORAGE.set(name, state);
        if (autosaveTimeout != null) {
            clearTimeout(autosaveTimeout);
            autosaveTimeout = setTimeout(autosave, autosaveTime);
        }
        // write state data
        cacheData(state, false);
    }

    async load(name) {
        if (await STORAGE.has(name)) {
            const state = SavestateConverter.convert(await STORAGE.get(name));
            if (autosaveTimeout != null) {
                clearTimeout(autosaveTimeout);
                autosaveTimeout = setTimeout(autosave, autosaveTime);
            }
            // write state data
            Savestate.deserialize(state);
            cacheData(state, false);
            // trigger event
            const ev = new Event("state");
            ev.data = {
                notes: state.notes,
                data: state.data,
                options: state.options
            };
            this.dispatchEvent(ev);
        }
    }

    async setAutosave(time, amount) {
        if (time > 0) {
            autosaveMax = amount;
            autosaveTime = time * 60000;
            await removeOverflowAutosaves();
            if (autosaveTimeout != null) {
                clearTimeout(autosaveTimeout);
            }
            autosaveTimeout = setTimeout(autosave, autosaveTime);
        } else if (autosaveTimeout != null) {
            clearTimeout(autosaveTimeout);
            autosaveTimeout = null;
        }
    }

    getName() {
        return Savestate.name;
    }

    isDirty() {
        return LocalStorage.get(STATE_DIRTY);
    }

    reset(data, options) {
        // write state data
        Savestate.deserialize({
            data,
            options
        });
        const state = Savestate.serialize();
        cacheData(state, false);
        // trigger event
        const ev = new Event("state");
        ev.data = {
            notes: state.notes,
            data: state.data,
            options: state.options
        };
        this.dispatchEvent(ev);
    }

    overwrite(data, options) {
        const state = Savestate.serialize();
        // write data
        if (typeof data == "object") {
            for (const name in data) {
                state.data[name] = {};
                for (const key in data[name]) {
                    state.data[name][key] = data[name][key];
                }
            }
        }
        if (typeof defaultOptions == "object") {
            for (const key in options) {
                state.options[key] = options[key];
            }
        }
        // write state data
        Savestate.deserialize(state);
        cacheData(state, true);
        // trigger event
        const ev = new Event("state");
        ev.data = {
            notes: state.notes,
            data: state.data,
            options: state.options
        };
        this.dispatchEvent(ev);
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

}

const savestate = Object.freeze(new SavestateHandler());
window.savestate = savestate;
export default savestate;
