import WorldResource from "../../../resource/WorldResource.js";
import AbstractStateManager from "../../abstract/StateManager.js";
import DefaultCollectionState from "./DefaultState.js";

const resourceData = WorldResource.get("collection");

class CollectionStateManager extends AbstractStateManager {
    
    constructor() {
        super(DefaultCollectionState, resourceData);
    }

    createState(StateClass, ref, props) {
        return new StateClass(`collection/${ref}`, props);
    }

}

export default new CollectionStateManager();
