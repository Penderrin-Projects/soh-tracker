import AreaStateManager from "/GameTrackerJS/state/world/area/StateManager.js";
import GTOverworldState from "/GameTrackerJS/state/world/area/OverworldState.js";

import OverworldListHandler from "../../../util/handler/OverworldListHandler.js";

export default class OverworldState extends GTOverworldState {

    get defaultAccess() {
        return OverworldListHandler.defaultAccess;
    }
    
    /* list */
    generateOverworldList() {
        return new OverworldListHandler();
    }

}

AreaStateManager.register("overworld", OverworldState);
