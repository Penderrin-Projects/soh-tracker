import StateManager from "/GameTrackerJS/state/world/area/StateManager.js";
import MarkerListHandler from "/GameTrackerJS/util/MarkerListHandler.js";
import DefaultState from "/GameTrackerJS/state/world/area/DefaultState.js";

export default class AreaState extends DefaultState {
    
    generateList() {
        const listHandler = new MarkerListHandler(this.areaData.lists["v"]);
        listHandler.addEventListener("access", event => {
            this.setAccess(event.data);
        });
        return listHandler;
    }

}

StateManager.register("area", AreaState);
