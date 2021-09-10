import WorldResource from "../../../resource/WorldResource.js";
import AbstractStateManager from "../../StateManager.js";
import DefaultCollectionState from "./DefaultState.js";

const resourceData = WorldResource.get("collection");

class CollectionStateManager extends AbstractStateManager {
    
    constructor() {
        super(DefaultCollectionState, resourceData);
    }

}

export default new CollectionStateManager();
