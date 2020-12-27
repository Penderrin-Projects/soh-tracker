import FileData from "/emcJS/data/FileData.js";
import AbstractStateManager from "../../abstract/StateManager.js";
import DefaultState from "./DefaultState.js";

let DATA = null;

class StateManager extends AbstractStateManager {

    constructor() {
        super(DefaultState);
    }

    createState(StateClass, ref, props) {
        const data = DATA[ref];
        return new StateClass(`subarea/${ref}`, props, data);
    }
    
    initData() {
        if (DATA == null) {
            DATA = FileData.get("world/subarea");
        }
        return FileData.get("world/marker/subarea");
    }

}

export default new StateManager();
