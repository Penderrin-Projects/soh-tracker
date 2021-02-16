import StateManager from "/GameTrackerJS/state/world/area/StateManager.js";
import MarkerListHandler from "/GameTrackerJS/util/MarkerListHandler.js";
import DefaultState from "/GameTrackerJS/state/world/area/DefaultState.js";

export default class AreaState extends DefaultState {
    
    generateList() {
        const listHandler = new MarkerListHandler(this.areaData.lists["v"]);
        listHandler.addEventListener("access", event => {
            this.setAccess(event.data);
        });
        listHandler.addEventListener("change", event => {
            if (event.list != null) {
                const ev = new Event("list_update");
                ev.data = event.list;
                this.dispatchEvent(ev);
            }
        });
        return listHandler;
    }

}

StateManager.register("area", AreaState);
