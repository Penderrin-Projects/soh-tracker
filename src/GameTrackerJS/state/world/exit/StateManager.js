import WorldResource from "../../../resource/WorldResource.js";
import AbstractStateManager from "../../abstract/StateManager.js";
import DefaultState from "./DefaultState.js";

const resourceData = WorldResource.get("marker/exit");
const DATA = WorldResource.get("exit");

class StateManager extends AbstractStateManager {

    constructor() {
        super(DefaultState, resourceData);
    }

    createState(StateClass, ref, props) {
        const data = DATA[props.access];
        return new StateClass(`exit/${ref}`, props, data);
    }

}

export default new StateManager();
