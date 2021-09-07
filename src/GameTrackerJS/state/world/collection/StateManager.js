import WorldResource from "../../../resource/WorldResource.js";
import AbstractStateManager from "../../abstract/StateManager.js";
import CollectionState from "./DefaultState.js";

const resourceData = WorldResource.get("collection");

class CollectionStateManager extends AbstractStateManager {
    
    constructor() {
        super(CollectionState, resourceData);
    }

}

export default new CollectionStateManager();
