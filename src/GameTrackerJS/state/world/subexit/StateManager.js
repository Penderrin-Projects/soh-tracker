import FileData from "/emcJS/data/FileData.js";
import AbstractStateManager from "../../abstract/StateManager.js";
import EntranceStateManager from "../entrance/StateManager.js";
import DefaultState from "./DefaultState.js";

class StateManager extends AbstractStateManager {

    constructor() {
        super(DefaultState);
    }

    createState(StateClass, ref, props) {
        const data = EntranceStateManager.get(props.access);
        return new StateClass(`subexit/${ref}`, props, data.props);
    }
    
    initData() {
        return FileData.get("world/marker/subexit");
    }

}

export default new StateManager();
