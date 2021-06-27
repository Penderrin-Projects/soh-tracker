// GameTrackerJS
import AbstractStateManager from "/GameTrackerJS/state/abstract/StateManager.js";
// Track-OOT
import ShopsResource from "/script/resource/ShopsResource.js";
import DefaultState from "./DefaultState.js";

const resourceData = ShopsResource.get();

class StateManager extends AbstractStateManager {

    constructor() {
        super(DefaultState, resourceData);
    }

}

export default new StateManager();
