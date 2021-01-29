import ItemsRecource from "../../resource/ItemsResource.js";
import AbstractStateManager from "../abstract/StateManager.js";
import DefaultState from "./DefaultState.js";

const resourceData = ItemsRecource.get();

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
