import FileData from "/emcJS/data/FileData.js";
import AbstractStateManager from "/GameTrackerJS/state/abstract/StateManager.js";
import DefaultState from "./DefaultState.js";

class StateManager extends AbstractStateManager {

    constructor() {
        super(DefaultState);
    }
    
    initData() {
        return FileData.get("shops");
    }

}

export default new StateManager();
