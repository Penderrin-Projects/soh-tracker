import WorldResource from "../../../resource/WorldResource.js";
import AbstractStateManager from "../../StateManager.js";
import DefaultEntranceState from "./DefaultState.js";

const resourceData = WorldResource.get("exit");

class EntranceStateManager extends AbstractStateManager {
    
    constructor() {
        super(DefaultEntranceState, resourceData);
    }

}

export default new EntranceStateManager();
