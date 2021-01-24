/**
 * @deprecated
 */

import EventBus from "/emcJS/event/EventBus.js";
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";

class StateStorage {

    constructor() {
        Savestate.addEventListener("change", event => {
            if (event.category == null) {
                EventBus.trigger("statechange", event.data);
            } else {
                EventBus.trigger(`statechange_${event.category}`, event.data);
            }
        });
        Savestate.addEventListener("options", event => {
            EventBus.trigger("statechange", event.data);
        });
    }

    async save(name) {
        SavestateHandler.save(name);
    }

    async load(name) {
        SavestateHandler.load(name);
        {
            const state = Savestate.serialize();
            const data = state.data[""];
            for (const [key, value] of Object.entries(state.options)) {
                data[key] = value;
            }
            const extra = state.data;
            delete extra[""];
            EventBus.trigger("state", {
                notes: state.notes,
                state: data,
                extra: extra
            });
        }
    }

    async setAutosave(time, amount) {
        SavestateHandler.setAutosave(time, amount);
    }

    reset(data, extraData) {
        SavestateHandler.reset(data, extraData);
        {
            const state = Savestate.serialize();
            const data = state.data[""];
            for (const [key, value] of Object.entries(state.options)) {
                data[key] = value;
            }
            const extra = state.data;
            delete extra[""];
            EventBus.trigger("state", {
                notes: state.notes,
                state: data,
                extra: extra
            });
        }
    }

    overwrite(data, extraData) {
        SavestateHandler.overwrite(data, extraData);
        {
            const state = Savestate.serialize();
            const data = state.data[""];
            for (const [key, value] of Object.entries(state.options)) {
                data[key] = value;
            }
            const extra = state.data;
            delete extra[""];
            EventBus.trigger("state", {
                notes: state.notes,
                state: data,
                extra: extra
            });
        }
    }

    getName() {
        return SavestateHandler.getName();
    }

    isDirty() {
        return SavestateHandler.isDirty();
    }

    write(key, value) {
        SavestateHandler.set("", key, value);
    }

    read(key, value) {
        return SavestateHandler.get("", key, value);
    }

    getAll() {
        return SavestateHandler.getAll("");
    }

    writeNotes(value) {
        SavestateHandler.setNotes(value);
    }

    readNotes() {
        return SavestateHandler.getNotes();
    }

    writeExtra(category, key, value) {
        SavestateHandler.set(category, key, value);
    }

    writeAllExtra(data) {
        for (const c in data) {
            const state = data[c];
            this.writeExtra(c, state);
        }
    }

    readExtra(category, key, value) {
        return SavestateHandler.get(category, key, value);
    }

    readAllExtra(category) {
        if (category == null) {
            const res = SavestateHandler.getAll();
            delete res[""];
            return res;
        } else {
            return SavestateHandler.getAll();
        }
    }

}

export default new StateStorage();
