import WorldResource from "../../../resource/WorldResource.js";
import AbstractStateManager from "../../abstract/StateManager.js";
import DefaultState from "./DefaultState.js";

const resourceData = WorldResource.get("exit");

const EMPTY_STATE = new DefaultState("\u0000", {
    "type": "empty",
    "target": "\u0000",
    "bindsTo": [],
    "ignoreBound": true,
    "active": false,
    "includeInactiveEntrances": true,
    "area": "area/\u0000",
    "isBiDir": true
});

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

}

export default new StateManager();
