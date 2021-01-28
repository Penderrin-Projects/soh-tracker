import WorldResource from "../../data/WorldResource.js";
import AbstractStateManager from "../abstract/StateManager.js";
import DefaultState from "./DefaultState.js";

const resourceData = WorldResource.get("marker/location");

class StateManager extends AbstractStateManager {
    
    constructor() {
        super(DefaultState, resourceData);
    }
    
    createState(StateClass, ref, props) {
        return new StateClass(`location/${ref}`, props);
    }

}

const stateManager = new StateManager();
for (const ref in resourceData) {
    stateManager.get(ref);
}

export default stateManager;
