// GameTrackerJS
import AbstractStateManager from "/GameTrackerJS/state/StateManager.js";
// Track-OOT
import SongsResource from "/script/resource/SongsResource.js";
import DefaultState from "./DefaultState.js";

const resourceData = SongsResource.get();

class StateManager extends AbstractStateManager {

    constructor() {
        super(DefaultState, resourceData);
    }

}

export default new StateManager();
