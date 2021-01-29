import WorldResource from "../../resource/WorldResource.js";
import AbstractStateManager from "../abstract/StateManager.js";
import DefaultState from "./DefaultState.js";

const resourceData = WorldResource.get("exit");

class StateManager extends AbstractStateManager {
    
    constructor() {
        super(DefaultState, resourceData);
    }

}

const stateManager = new StateManager();
for (const ref in resourceData) {
    stateManager.get(ref);
}

export default stateManager;
