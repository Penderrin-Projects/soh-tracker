// GameTrackerJS
import AbstractStateManager from "/GameTrackerJS/state/abstract/StateManager.js";
// Track-OOT
import SongsResource from "/script/resource/SongsResource.js";
import DefaultState from "./DefaultState.js";

const resourceData = SongsResource.get();

class StateManager extends AbstractStateManager {

    constructor() {
        super(DefaultState, resourceData);
    }

}

const stateManager = new StateManager();
for (const ref in resourceData) {
    stateManager.get(ref);
}

export default stateManager;
