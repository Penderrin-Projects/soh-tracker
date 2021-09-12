import WorldResource from "../../resource/WorldResource.js";
import { emptyState } from "./EmptyState.js";
import StateManager from "../StateManager.js";
import AreaStateManager from "./area/StateManager.js";
import EntranceStateManager from "./entrance/StateManager.js";
import ExitStateManager from "./exit/StateManager.js";
import LocationStateManager from "./location/StateManager.js";
import CollectionStateManager from "./collection/StateManager.js";
import "./area/OverworldState.js";

const CONFIG = WorldResource.get("config");
const DEFAULT_TYPES = new Map();
const CUSTOM_TYPES = new Map();

DEFAULT_TYPES.set("location", LocationStateManager);
DEFAULT_TYPES.set("collection", CollectionStateManager);
DEFAULT_TYPES.set("area", AreaStateManager);
DEFAULT_TYPES.set("exit", ExitStateManager);
DEFAULT_TYPES.set("entrance", EntranceStateManager);

class WorldStateManager {

    getEmpty() {
        return emptyState;
    }

    get(category, id) {
        if (typeof category != "string") {
            throw new TypeError(`category parameter must be of type "string" but was "${typeof category}"`);
        }
        if (typeof id != "string") {
            throw new TypeError(`id parameter must be of type "string" but was "${typeof id}"`);
        }
        if (category == "" || id == "") {
            return this.getEmpty();
        }
        const manager = DEFAULT_TYPES.get(category);
        if (manager != null) {
            return manager.get(id);
        } else {
            const customManager = CUSTOM_TYPES.get(category);
            if (customManager != null) {
                return customManager.get(id);
            } else {
                throw new Error(`manager for category "${category}" not initialized before usage`);
            }
        }
    }

    register(category, manager) {
        if (typeof category != "string") {
            throw new TypeError(`category parameter must be of type "string" but was "${typeof category}"`);
        }
        if (!(manager instanceof StateManager)) {
            throw new TypeError(`manager parameter must be an instance of StateManager`);
        }
        CUSTOM_TYPES.set(category, manager);
    }

}

if (!!CONFIG.prefetchEntries) {
    setTimeout(() => {

        for (const [category, manager] of DEFAULT_TYPES) {
            const data = WorldResource.get(category);
    
            for (const id in data) {
                manager.get(id);
            }
        }

        for (const [category, manager] of CUSTOM_TYPES) {
            const data = WorldResource.get(category);
    
            for (const id in data) {
                manager.get(id);
            }
        }
    
    }, 0);
}

export default new WorldStateManager();
