// GameTrackerJS
import AbstractStateManager from "/GameTrackerJS/state/StateManager.js";
// Track-OOT
import DungeonstateResource from "/script/resource/DungeonstateResource.js";
import DefaultState from "./DefaultState.js";

const resourceData = DungeonstateResource.get();

class StateManager extends AbstractStateManager {

    constructor() {
        super(DefaultState, resourceData);
    }

}

export default new StateManager();
