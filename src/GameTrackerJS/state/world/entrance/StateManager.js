import FileData from "/emcJS/data/FileData.js";
import AbstractStateManager from "../../abstract/StateManager.js";
import DefaultState from "./DefaultState.js";

class StateManager extends AbstractStateManager {

    constructor() {
        super(DefaultState);
    }

    createState(StateClass, ref, props) {
        return new StateClass(ref, props);
    }
    
    initData() {
        return FileData.get("world/exit");
    }

}

export default new StateManager();
