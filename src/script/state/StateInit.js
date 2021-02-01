import "/script/state/item/ItemState.js";
/* asym-import: off */
import Import from "/emcJS/util/import/Import.js";
/* asym-import: on */

// Track-OOT
import "/script/state/item/InfiniteItemState.js";
import "/script/state/item/KeyState.js";
import "/script/state/item/RewardItemState.js";
import "/script/state/item/StartItemState.js";
import "/script/state/item/VariableMaxItemState.js";
import "/script/state/world/area/AreaState.js";
import "/script/state/world/area/DungeonState.js";
import "/script/state/world/location/LocationState.js";
import "/script/state/world/location/GossipstoneState.js";

// GameTrackerJS
await Import.module("/GameTrackerJS/state/StateInit.js");
// Track-OOT
await Import.module("/script/state/dungeonstate/StateManager.js");
