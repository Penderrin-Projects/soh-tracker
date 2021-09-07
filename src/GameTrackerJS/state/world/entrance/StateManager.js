import WorldResource from "../../../resource/WorldResource.js";
import AbstractStateManager from "../../abstract/StateManager.js";
import EntranceState from "./DefaultState.js";

const resourceData = WorldResource.get("exit");

class EntranceStateManager extends AbstractStateManager {
    
    constructor() {
        super(EntranceState, resourceData);
    }

}

export default new EntranceStateManager();
