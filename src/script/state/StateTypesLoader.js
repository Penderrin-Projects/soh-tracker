// GameTrackerJS
import ItemStateManager from "/GameTrackerJS/statemanager/item/ItemStateManager.js";
import LocationStateManager from "/GameTrackerJS/statemanager/world/location/LocationStateManager.js";
import "/GameTrackerJS/statemanager/world/collection/CollectionStateManager.js";
import "/GameTrackerJS/statemanager/world/area/AreaStateManager.js";
import "/GameTrackerJS/statemanager/world/entrance/EntranceStateManager.js";
import "/GameTrackerJS/statemanager/world/exit/ExitStateManager.js";
import "/GameTrackerJS/state/world/area/OverworldState.js";

// Track-OOT
import DefaultAPItemState from "./item/DefaultAPItemState.js";
import "./item/StartSettingsState.js";
import "./item/KeyState.js";
import "./item/RewardItemState.js";
import DefaultAPLocationState from "./world/location/DefaultAPLocationState.js";
import "./world/area/AreaState.js";
import "./world/area/ShopState.js";
import "./world/location/GossipstoneState.js";
import "./world/location/ShopSlotState.js";
import "./world/location/ScrubLocationState.js";

ItemStateManager.setDefaultState(DefaultAPItemState);
LocationStateManager.setDefaultState(DefaultAPLocationState);
