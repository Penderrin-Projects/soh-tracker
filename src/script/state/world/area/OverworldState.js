import AreaStateManager from "/GameTrackerJS/statemanager/world/area/AreaStateManager.js";
import GTOverworldState from "/GameTrackerJS/state/world/area/OverworldState.js";

import OverworldListHandler, {
    getDefaultAccess
} from "../../../util/handler/OverworldListHandler.js";

export default class OverworldState extends GTOverworldState {

    get defaultAccess() {
        return getDefaultAccess();
    }
    
    /* list */
    generateOverworldList() {
        return new OverworldListHandler();
    }

}

AreaStateManager.register("overworld", OverworldState);
