import WorldResource from "../../../resource/WorldResource.js";
import AbstractStateManager from "../../StateManager.js";
import DefaultLocationState from "./DefaultState.js";

const resourceData = WorldResource.get("location");

class LocationStateManager extends AbstractStateManager {

    constructor() {
        super(DefaultLocationState, resourceData);
    }

}

export default new LocationStateManager();
