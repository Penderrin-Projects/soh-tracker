import WorldResource from "../../../resource/WorldResource.js";
import AbstractStateManager from "../../StateManager.js";
import DefaultExitState from "./DefaultState.js";

const resourceData = WorldResource.get("exit");

class ExitStateManager extends AbstractStateManager {
    
    constructor() {
        super(DefaultExitState, resourceData);
    }

}

export default new ExitStateManager();
