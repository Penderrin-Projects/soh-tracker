import FileData from "/emcJS/data/FileData.js";
import AbstractStateManager from "../../abstract/StateManager.js";
import DefaultState from "./DefaultState.js";

let AREA_DATA = null;

class StateManager extends AbstractStateManager {

    constructor() {
        super(DefaultState);
    }

    createState(StateClass, ref, props) {
        const data = AREA_DATA[ref];
        return new StateClass(`area/${ref}`, props, data);
    }
    
    initData() {
        if (AREA_DATA == null) {
            AREA_DATA = FileData.get("world/area");
        }
        return FileData.get("world/marker/area");
    }

}

export default new StateManager();
