import WorldResource from "../../../resource/WorldResource.js";
import WorldStateManagers from "../StateManagers.js";
import AbstractStateManager from "../../abstract/StateManager.js";
import DefaultState from "./DefaultState.js";

const resourceData = WorldResource.get("marker/subexit");
const DATA = WorldResource.get("exit");

class StateManager extends AbstractStateManager {
    
    constructor() {
        super(DefaultState, resourceData);
        WorldStateManagers.subexit = this;
    }

    createState(StateClass, ref, props) {
        const data = DATA[props.access];
        return new StateClass(`subexit/${ref}`, props, data);
    }

}

export default new StateManager();
