import FileData from "/emcJS/data/FileData.js";
// world
import OverworldState from "/GameTrackerJS/state/world/OverworldState.js";
import LocationStates from "/GameTrackerJS/state/world/location/StateManager.js";
import AreaStates from "/GameTrackerJS/state/world/area/StateManager.js";
import SubAreaStates from "/GameTrackerJS/state/world/subarea/StateManager.js";
import ExitStates from "/GameTrackerJS/state/world/exit/StateManager.js";
import SubExitStates from "/GameTrackerJS/state/world/subexit/StateManager.js";
// items
import ItemStates from "/GameTrackerJS/state/item/StateManager.js";
// dungeonstate
import DungeonstateStates from "/script/state/dungeonstate/StateManager.js";

let initialized = false;

class StateInit {

    init() {
        if (!initialized) {
            initialized = true;
            // overworld element
            new OverworldState(FileData.get("world/overworld"));
            // locations
            const locations = FileData.get("world/marker/location");
            for (const ref in locations) {
                LocationStates.get(ref);
            }
            // areas
            const areas = FileData.get("world/marker/area");
            for (const ref in areas) {
                AreaStates.get(ref);
            }
            // subareas
            const subareas = FileData.get("world/marker/subarea");
            for (const ref in subareas) {
                SubAreaStates.get(ref);
            }
            // exits
            const exits = FileData.get("world/marker/exit");
            for (const ref in exits) {
                ExitStates.get(ref);
            }
            // subexits
            const subexits = FileData.get("world/marker/subexit");
            for (const ref in subexits) {
                SubExitStates.get(ref);
            }
            // dungeonstate
            const dungeonstate = FileData.get("dungeonstate");
            for (const cat in dungeonstate) {
                for (const ref in dungeonstate[cat]) {
                    DungeonstateStates.get(`${cat}/${ref}`);
                }
            }
            // items
            const items = FileData.get("items");
            for (const ref in items) {
                ItemStates.get(ref);
            }
        }
    }

}

export default new StateInit();
