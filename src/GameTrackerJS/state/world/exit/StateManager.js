import FileData from "/emcJS/data/FileData.js";
import AbstractStateManager from "../../abstract/StateManager.js";
import DefaultState from "./DefaultState.js";

let DATA = null;

class StateManager extends AbstractStateManager {

    constructor() {
        super(DefaultState);
    }

    createState(StateClass, ref, props) {
        const data = DATA[props.access];
        return new StateClass(`exit/${ref}`, props, data);
    }
    
    initData() {
        if (DATA == null) {
            DATA = FileData.get("world/exit");
        }
        return FileData.get("world/marker/exit");
    }

}

export default new StateManager();
