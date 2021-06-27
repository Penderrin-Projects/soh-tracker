import WorldResource from "../../../resource/WorldResource.js";
import WorldStateManagers from "../StateManagers.js";
import AbstractStateManager from "../../abstract/StateManager.js";
import DefaultState from "./DefaultState.js";

const resourceData = WorldResource.get("marker/location");

class StateManager extends AbstractStateManager {
    
    constructor() {
        super(DefaultState, resourceData);
        WorldStateManagers.location = this;
    }
    
    createState(StateClass, ref, props) {
        return new StateClass(`location/${ref}`, props);
    }

}

export default new StateManager();
