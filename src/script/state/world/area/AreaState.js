import AreaStateManager from "/GameTrackerJS/state/world/area/StateManager.js";
import MarkerListHandler from "/GameTrackerJS/util/MarkerListHandler.js";
import AreaState from "/GameTrackerJS/state/world/area/DefaultState.js";

export default class AreaState extends AreaState {
    
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

AreaStateManager.register("area", AreaState);
