import WorldResource from "../../../resource/WorldResource.js";
import AbstractStateManager from "../../abstract/StateManager.js";
import DefaultAreaState from "./DefaultState.js";

const resourceData = WorldResource.get("marker/area");
const DATA = WorldResource.get("area");

class AreaStateManager extends AbstractStateManager {
    
    constructor() {
        super(DefaultAreaState, resourceData);
    }

    createState(StateClass, ref, props) {
        const data = DATA[ref];
        return new StateClass(`area/${ref}`, props, data);
    }

}

export default new AreaStateManager();
