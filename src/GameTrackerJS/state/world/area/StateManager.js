import WorldResource from "../../../resource/WorldResource.js";
import AbstractStateManager from "../../abstract/StateManager.js";
import AreaState from "./DefaultState.js";

const resourceData = WorldResource.get("marker/area");
const DATA = WorldResource.get("area");

class AreaStateManager extends AbstractStateManager {
    
    constructor() {
        super(AreaState, resourceData);
    }

    createState(StateClass, ref, props) {
        const data = DATA[ref];
        return new StateClass(`area/${ref}`, props, data);
    }

}

export default new AreaStateManager();
