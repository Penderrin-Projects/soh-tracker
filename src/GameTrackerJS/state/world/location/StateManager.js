import FileData from "/emcJS/data/FileData.js";
import AbstractStateManager from "../../abstract/StateManager.js";
import DefaultState from "./DefaultState.js";

class StateManager extends AbstractStateManager {

    constructor() {
        super(DefaultState);
    }

    createState(StateClass, ref, props) {
        return new StateClass(`location/${ref}`, props);
    }
    
    initData() {
        return FileData.get("world/marker/location");
    }

}

export default new StateManager();
