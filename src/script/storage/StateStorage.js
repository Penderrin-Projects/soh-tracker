/**
 * @deprecated
 */

import EventBus from "/emcJS/event/EventBus.js";
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import OptionsStorage from "/GameTrackerJS/storage/OptionsStorage.js";

class StateStorage {

    constructor() {
        SavestateHandler.addEventListener("state", event => {
            const {data: {"": state, ...extra}, options, notes} = event.data;
            for (const [key, value] of Object.entries(options)) {
                state[key] = value;
            }
            EventBus.trigger("state", {
                notes,
                state,
                extra
            });
        });
        Savestate.addEventListener("change", event => {
            if (!event.category) {
                EventBus.trigger("statechange", event.changes);
            } else {
                EventBus.trigger(`statechange_${event.category}`, event.changes);
            }
        });
        Savestate.addEventListener("options", event => {
            EventBus.trigger("statechange", event.changes);
        });
    }

    async save(name) {
        SavestateHandler.save(name);
    }

    async load(name) {
        SavestateHandler.load(name);
    }

    async setAutosave(time, amount) {
        SavestateHandler.setAutosave(time, amount);
    }

    reset(data = {}, extraData = {}, options = {}) {
        const newData = {
            ...extraData,
            "": data
        }
        SavestateHandler.reset(newData, options);
    }

    overwrite(data = {}, extraData = {}, options = {}) {
        const newData = {
            ...extraData,
            "": data
        }
        SavestateHandler.overwrite(newData, options);
    }

    getName() {
        return SavestateHandler.getName();
    }

    isDirty() {
        return SavestateHandler.isDirty();
    }

    write(key, value) {
        if (OptionsStorage.has(key)) {
            if (typeof key == "object") {
                OptionsStorage.setAll(key);
            } else {
                OptionsStorage.set(key, value);
            }
        } else {
            SavestateHandler.set("", key, value);
        }
    }

    read(key, value) {
        if (OptionsStorage.has(key)) {
            OptionsStorage.get(key, value);
        } else {
            return SavestateHandler.get("", key, value);
        }
    }

    getAll() {
        return {
            ...SavestateHandler.getAll(""),
            ...OptionsStorage.getAll()
        };
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
