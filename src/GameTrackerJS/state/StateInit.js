import FileData from "/emcJS/data/FileData.js";
/* world */
import OverworldState from "./world/OverworldState.js";
import LocationStates from "./world/location/StateManager.js";
import AreaStates from "./world/area/StateManager.js";
import SubAreaStates from "./world/subarea/StateManager.js";
import ExitStates from "./world/exit/StateManager.js";
import SubExitStates from "./world/subexit/StateManager.js";
import EntranceStates from "./world/entrance/StateManager.js";
/* item */
import ItemStates from "./item/StateManager.js";

let initialized = false;

class StateInit {

    init() {
        if (!initialized) {
            initialized = true;
            // locations
            const locations = FileData.get("world/marker/location");
            for (const ref in locations) {
                LocationStates.get(ref);
            }
            // entrances
            const entrances = FileData.get("world/exit");
            for (const ref in entrances) {
                EntranceStates.get(ref);
            }
            // subareas
            const subareas = FileData.get("world/marker/subarea");
            for (const ref in subareas) {
                SubAreaStates.get(ref);
            }
            // subexits
            const subexits = FileData.get("world/marker/subexit");
            for (const ref in subexits) {
                SubExitStates.get(ref);
            }
            // areas
            const areas = FileData.get("world/marker/area");
            for (const ref in areas) {
                AreaStates.get(ref);
            }
            // exits
            const exits = FileData.get("world/marker/exit");
            for (const ref in exits) {
                ExitStates.get(ref);
            }
            // overworld element
            new OverworldState(FileData.get("world/overworld"));
            // items
            const items = FileData.get("items");
            for (const ref in items) {
                ItemStates.get(ref);
            }
        }
    }

}

export default new StateInit();
