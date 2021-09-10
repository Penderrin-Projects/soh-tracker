import WorldResource from "../../../resource/WorldResource.js";
import AbstractStateManager from "../../StateManager.js";
import DefaultAreaState from "./DefaultState.js";

const resourceData = WorldResource.get("area");

class AreaStateManager extends AbstractStateManager {
    
    constructor() {
        super(DefaultAreaState, resourceData);
    }

}

export default new AreaStateManager();
