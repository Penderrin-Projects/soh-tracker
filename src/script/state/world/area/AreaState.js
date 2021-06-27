import StateManager from "/GameTrackerJS/state/world/area/StateManager.js";
import MarkerListHandler from "/GameTrackerJS/util/MarkerListHandler.js";
import DefaultState from "/GameTrackerJS/state/world/area/DefaultState.js";

export default class AreaState extends DefaultState {
    
    generateList() {
        const listHandler = new MarkerListHandler(this.areaData.lists["v"], `${this.ref}/v`);
        listHandler.addEventListener("access", event => {
            const ev = new Event("access");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        listHandler.addEventListener("change", event => {
            this.checkAllFilter();
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
