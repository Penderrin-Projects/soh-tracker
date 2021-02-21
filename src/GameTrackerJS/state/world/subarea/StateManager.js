import WorldResource from "../../../resource/WorldResource.js";
import WorldStateManagers from "../StateManagers.js";
import AbstractStateManager from "../../abstract/StateManager.js";
import DefaultState from "./DefaultState.js";

const resourceData = WorldResource.get("marker/subarea");
const DATA = WorldResource.get("subarea");

class StateManager extends AbstractStateManager {
    
    constructor() {
        super(DefaultState, resourceData);
        WorldStateManagers.subarea = this;
    }

    createState(StateClass, ref, props) {
        const data = DATA[ref];
        return new StateClass(`subarea/${ref}`, props, data);
    }

}

export default new StateManager();
