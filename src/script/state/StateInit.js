import FileData from "/emcJS/data/FileData.js";
/* GameTrackerJS - world */
import OverworldState from "/GameTrackerJS/state/world/OverworldState.js";
import LocationStates from "/GameTrackerJS/state/world/location/StateManager.js";
import AreaStates from "/GameTrackerJS/state/world/area/StateManager.js";
import SubAreaStates from "/GameTrackerJS/state/world/subarea/StateManager.js";
import ExitStates from "/GameTrackerJS/state/world/exit/StateManager.js";
import SubExitStates from "/GameTrackerJS/state/world/subexit/StateManager.js";
import EntranceStates from "/GameTrackerJS/state/world/entrance/StateManager.js";
/* GameTrackerJS - item */
import ItemStates from "/GameTrackerJS/state/item/StateManager.js";
/* Track-OOT - dungeonstate */
import DungeonstateStates from "/script/state/dungeonstate/StateManager.js";
/* Track-OOT - item */
import "/script/state/item/ItemState.js";
import "/script/state/item/InfiniteItemState.js";
import "/script/state/item/KeyState.js";
import "/script/state/item/RewardItemState.js";
import "/script/state/item/StartItemState.js";
import "/script/state/item/VariableMaxItemState.js";
/* Track-OOT - world */
import "/script/state/world/area/AreaState.js";
import "/script/state/world/area/DungeonState.js";
import "/script/state/world/location/LocationState.js";
import "/script/state/world/location/GossipstoneState.js";

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
