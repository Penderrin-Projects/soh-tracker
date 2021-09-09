import WorldResource from "../../../resource/WorldResource.js";
import AbstractStateManager from "../../abstract/StateManager.js";
import DefaultLocationState from "./DefaultState.js";

const resourceData = WorldResource.get("marker/location");

class LocationStateManager extends AbstractStateManager {
    
    constructor() {
        super(DefaultLocationState, resourceData);
    }
    
    createState(StateClass, ref, props) {
        return new StateClass(`location/${ref}`, props);
    }

}

export default new LocationStateManager();
