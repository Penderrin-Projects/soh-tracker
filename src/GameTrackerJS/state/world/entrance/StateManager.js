import WorldResource from "../../../resource/WorldResource.js";
import WorldStateManagers from "../StateManagers.js";
import AbstractStateManager from "../../abstract/StateManager.js";
import DefaultState from "./DefaultState.js";

const resourceData = WorldResource.get("exit");

class StateManager extends AbstractStateManager {
    
    constructor() {
        super(DefaultState, resourceData);
        WorldStateManagers.entrance = this;
    }

}

export default new StateManager();
