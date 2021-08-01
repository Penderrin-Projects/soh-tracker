import WorldResource from "../../../resource/WorldResource.js";
import AbstractStateManager from "../../abstract/StateManager.js";
import DefaultState from "./DefaultState.js";

const resourceData = WorldResource.get("marker/area");
const DATA = WorldResource.get("area");

const EMPTY_STATE = new DefaultState("area/\u0000");

class StateManager extends AbstractStateManager {
    
    constructor() {
        super(DefaultState, resourceData);
    }

    // get(ref) {
    //     if (ref == "\u0000") {
    //         return EMPTY_STATE;
    //     } else {
    //         return super.get(ref);
    //     }
    // }

    createState(StateClass, ref, props) {
        const data = DATA[ref];
        return new StateClass(`area/${ref}`, props, data);
    }

}

export default new StateManager();
