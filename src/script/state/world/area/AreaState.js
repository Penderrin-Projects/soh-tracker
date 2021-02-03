import WorldStateManagers from "/GameTrackerJS/state/world/StateManagers.js";
import StateManager from "/GameTrackerJS/state/world/area/StateManager.js";
import DefaultState from "/GameTrackerJS/state/world/area/DefaultState.js";

export default class AreaState extends DefaultState {

    getFilteredList() {
        const areaData = this.areaData;
        if (areaData != null) {
            const list = areaData.lists["v"];
            if (list != null) {
                const result = [];
                list.forEach(record => {
                    const state = WorldStateManagers.get(record.category, record.id);
                    if (state != null && state.visible) {
                        result.push(record);
                    }
                });
                return result;
            }
        }
    }

}

StateManager.register("area", AreaState);
