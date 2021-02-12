import WorldResource from "../../../resource/WorldResource.js";
import WorldStateManagers from "../StateManagers.js";
import AbstractStateManager from "../../abstract/StateManager.js";
import DefaultState from "./DefaultState.js";

const resourceData = WorldResource.get("marker/area");
const DATA = WorldResource.get("area");

class StateManager extends AbstractStateManager {
    
    constructor() {
        super(DefaultState, resourceData);
        WorldStateManagers.area = this;
    }

    createState(StateClass, ref, props) {
        const data = DATA[ref];
        return new StateClass(`area/${ref}`, props, data);
    }

}

export default new StateManager();
