import WorldResource from "../../resource/WorldResource.js";
import { emptyState } from "./EmptyState.js";
import AreaStateManager from "./area/StateManager.js";
import EntranceStateManager from "./entrance/StateManager.js";
import ExitStateManager from "./exit/StateManager.js";
import LocationStateManager from "./location/StateManager.js";
import CollectionStateManager from "./collection/StateManager.js";
import "./area/OverworldState.js";

const CONFIG = WorldResource.get("config");
const WORLD = {
    location: LocationStateManager,
    collection: CollectionStateManager,
    area: AreaStateManager,
    exit: ExitStateManager
};

class WorldStateManager {

    getEmpty() {
        return emptyState;
    }

    getLocation(id) {
        return LocationStateManager.get(id);
    }

    getCollection(id) {
        return CollectionStateManager.get(id);
    }

    getArea(id) {
        return AreaStateManager.get(id);
    }

    getExit(id) {
        return ExitStateManager.get(id);
    }

    getEntrance(id) {
        return EntranceStateManager.get(id);
    }

    get(category, id) {
        if (typeof category != "string") {
            throw new TypeError(`category parameter must be of type "string" but was "${typeof category}"`);
        }
        if (typeof id != "string") {
            throw new TypeError(`id parameter must be of type "string" but was "${typeof id}"`);
        }
        if (category == "\u0000" || id == "\u0000") {
            return this.getEmpty();
        }
        const Manager = WORLD[category];
        if (Manager != null) {
            return Manager.get(id);
        } else {
            throw new Error(`manager for category "${category}" not initialized before usage`);
        }
    }

}

if (!!CONFIG.prefetchEntries) {
    setTimeout(() => {
        const locations = WorldResource.get("collection");
        const collections = WorldResource.get("collection");
        const areas = WorldResource.get("collection");
        const exits = WorldResource.get("collection");
    
        for (const id in locations) {
            LocationStateManager.get(id);
        }
    
        for (const id in collections) {
            CollectionStateManager.get(id);
        }
    
        for (const id in areas) {
            AreaStateManager.get(id);
        }
    
        for (const id in exits) {
            ExitStateManager.get(id);
            EntranceStateManager.get(id);
        }
    
    }, 0);
}

export default new WorldStateManager();
