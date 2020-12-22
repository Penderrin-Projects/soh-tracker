import FileData from "/emcJS/data/FileData.js";
import LocationStates from "/script/state/LocationStates.js";
import AreaStates from "/script/state/AreaStates.js";
import SubAreaStates from "/script/state/SubAreaStates.js";
import ExitStates from "/script/state/ExitStates.js";
import SubExitStates from "/script/state/SubExitStates.js";
import ItemStates from "/script/state/ItemStates.js";

const STATE_ENTRIES = {
    "location": LocationStates,
    "area": AreaStates,
    "subarea": SubAreaStates,
    "exit": ExitStates,
    "subexit": SubExitStates
};

let initialized = false;

class StateInit {

    init() {
        if (!initialized) {
            initialized = true;
            const marker = FileData.get("world/marker");
            for (const cat in marker) {
                const entities = marker[cat];
                for (const ref in entities) {
                    STATE_ENTRIES[cat].get(`${cat}/${ref}`);
                }
            }
            const items = FileData.get("items");
            for (const ref in items) {
                ItemStates.get(ref);
            }
        }
    }

}

export default new StateInit();
