import WorldStateManagers from "/GameTrackerJS/state/world/StateManagers.js";
import StateManager from "/GameTrackerJS/state/world/area/StateManager.js";
import DefaultState from "/GameTrackerJS/state/world/area/DefaultState.js";

export default class AreaState extends DefaultState {

    generateLists() {
        const entityList = new Map();
        const filteredEntityList = new Map();
        const areaData = this.areaData;
        if (areaData != null) {
            const list = areaData.lists["v"];
            if (list != null) {
                list.forEach(record => {
                    const loc = WorldStateManagers.get(record.category, record.id);
                    if (loc != null) {
                        if (record.category != "area" && record.category != "exit") {
                            loc.addEventListener("access", event => {
                                if (loc.isVisible()) {
                                    this.refreshAccess();
                                }
                            });
                        }
                        loc.addEventListener("visible", () => {
                            if (loc.isVisible()) {
                                filteredEntityList.delete(loc);
                            } else {
                                filteredEntityList.set(loc, entityList.get(loc));
                            }
                            this.refreshAccess();
                        });
                        loc.addEventListener("filter", () => {
                            if (loc.isVisible()) {
                                filteredEntityList.delete(loc);
                            } else {
                                filteredEntityList.set(loc, entityList.get(loc));
                            }
                            this.refreshAccess();
                        });
                        entityList.set(loc, record);
                        if (loc.isVisible()) {
                            filteredEntityList.set(loc, record);
                        }
                    }
                });
            }
        }
        return [entityList, filteredEntityList];
    }

}

StateManager.register("area", AreaState);
