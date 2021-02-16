// GameTrackerJS
import "/GameTrackerJS/state/world/OverworldState.js";
import "/GameTrackerJS/state/world/area/DefaultState.js";
import "/GameTrackerJS/state/world/entrance/DefaultState.js";
import "/GameTrackerJS/state/world/exit/DefaultState.js";
import "/GameTrackerJS/state/world/location/DefaultState.js";
import "/GameTrackerJS/state/world/subarea/DefaultState.js";
import "/GameTrackerJS/state/world/subexit/DefaultState.js";
// Track-OOT
import area_AreaState from "/script/state/world/area/AreaState.js";
import area_DungeonState from "/script/state/world/area/DungeonState.js";
import location_LocationState from "/script/state/world/location/LocationState.js";
import location_GossipstoneState from "/script/state/world/location/GossipstoneState.js";

export const AreaState = area_AreaState;
export const DungeonState = area_DungeonState;
export const LocationState = location_LocationState;
export const GossipstoneState = location_GossipstoneState;

