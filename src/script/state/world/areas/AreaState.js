import AreaStates from "/script/state/AreaStates.js";
import AccessStateEnum from "/script/enum/AccessStateEnum.js";
import DefaultState from "/script/state/world/areas/DefaultState.js";
import WorldRegistry from "/script/registries/WorldRegistry.js";

export default class AreaState extends DefaultState {

    getFilteredList() {
        const areaData = this.areaData;
        if (areaData != null) {
            const list = areaData.lists["v"];
            if (list != null) {
                const result = [];
                list.forEach(record => {
                    const id = `${record.category}/${record.id}`;
                    const loc = WorldRegistry.get(id);
                    if (!!loc && loc.visible) {
                        result.push(record);
                    }
                });
                return result;
            }
        }
        return AccessStateEnum.UNAVAILABLE;
    }

}

AreaStates.register("area", AreaState);
