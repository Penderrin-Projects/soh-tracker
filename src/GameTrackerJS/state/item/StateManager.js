import ItemsRecource from "../../resource/ItemsResource.js";
import AbstractStateManager from "../abstract/StateManager.js";
import DefaultState from "./DefaultState.js";

const resourceData = ItemsRecource.get();

class StateManager extends AbstractStateManager {

    constructor() {
        super(DefaultState, resourceData);
    }

    // XXX
    createState(StateClass, ref, props) {
        return new StateClass(ref, props);
    }

}

export default new StateManager();
