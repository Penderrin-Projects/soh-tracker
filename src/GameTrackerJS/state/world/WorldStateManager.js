import { emptyState } from "./EmptyState.js";
import { overworldState } from "./OverworldState.js";
import AreaStateManager from "./area/StateManager.js";
import EntranceStateManager from "./entrance/StateManager.js";
import ExitStateManager from "./exit/StateManager.js";
import LocationStateManager from "./location/StateManager.js";
import SubareaStateManager from "./subarea/StateManager.js";
import SubexitStateManager from "./subexit/StateManager.js";
import CollectionStateManager from "./collection/StateManager.js";

const WORLD = {
    area: AreaStateManager,
    exit: ExitStateManager,
    location: LocationStateManager,
    subarea: SubareaStateManager,
    subexit: SubexitStateManager,
    collection: CollectionStateManager
};

class WorldStateManager {

    getEmpty() {
        return emptyState;
    }

    getOverworld() {
        return overworldState;
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
        if (category == "" || category == "overworld") {
            return this.getOverworld();
        }
        if (category == "\u0000") {
            return this.getEmpty();
        }
        const Manager = WORLD[category];
        if (Manager != null) {
            return Manager.get(id);
        } else {
            throw new Error(`manager for category "${category}" not initialized before usage`);
        }
    }

    getByRef(ref) {
        if (typeof ref != "string") {
            throw new TypeError(`ref parameter must be of type "string" but was "${typeof ref}"`);
        }
        if (ref == "" || ref == "overworld") {
            return this.getOverworld();
        }
        if (ref == "\u0000") {
            return this.getEmpty();
        }
        const [category, id] = ref.split("/");
        return this.get(category, id);
    }

}

export default new WorldStateManager();
