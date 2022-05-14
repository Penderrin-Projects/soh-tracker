import AreaStateManager from "/GameTrackerJS/statemanager/world/area/AreaStateManager.js";
import GTOverworldState from "/GameTrackerJS/state/world/area/OverworldState.js";

import WorldSummaryHandler, {
    getDefaultAccess
} from "../../../util/handler/WorldSummaryHandler.js";

export default class OverworldState extends GTOverworldState {

    get defaultAccess() {
        return getDefaultAccess();
    }

    /* list */
    generateOverworldList() {
        return new WorldSummaryHandler();
    }

}

AreaStateManager.register("overworld", OverworldState);
