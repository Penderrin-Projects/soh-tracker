import FileData from "/emcJS/data/FileData.js";
import AbstractStateManager from "../abstract/StateManager.js";
import DefaultState from "./DefaultState.js";

class StateManager extends AbstractStateManager {

    constructor() {
        super(DefaultState);
    }
    
    initData() {
        return FileData.get("items");
    }

}

export default new StateManager();
