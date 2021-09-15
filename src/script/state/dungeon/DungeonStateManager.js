// GameTrackerJS
import AbstractStateManager from "../../../GameTrackerJS/statemanager/AbstractStateManager.js";
// Track-OOT
import DungeonstateResource from "/script/resource/DungeonstateResource.js";
import DefaultDungeonState from "./DefaultDungeonState.js";

const resourceData = DungeonstateResource.get();

class DungeonStateManager extends AbstractStateManager {

    constructor() {
        super(DefaultDungeonState, resourceData);
    }

}

export default new DungeonStateManager();
