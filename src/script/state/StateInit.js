import FileData from "/emcJS/data/FileData.js";
/* GameTrackerJS */
import GTStateInit from "/GameTrackerJS/state/StateInit.js";
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
            // GameTrackerJS
            GTStateInit.init();
            // dungeonstate
            const dungeonstate = FileData.get("dungeonstate");
            for (const cat in dungeonstate) {
                for (const ref in dungeonstate[cat]) {
                    DungeonstateStates.get(`${cat}/${ref}`);
                }
            }
        }
    }

}

export default new StateInit();
