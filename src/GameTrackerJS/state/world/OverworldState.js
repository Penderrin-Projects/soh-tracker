import WorldResource from "../../resource/WorldResource.js";
import AccessStateEnum from "../../enum/AccessStateEnum.js";
import WorldStateManagers from "./StateManagers.js";
import "./area/StateManager.js";
import "./subarea/StateManager.js";
import "./exit/StateManager.js";
import "./subexit/StateManager.js";
import "./location/StateManager.js";

const AREA_DATA = WorldResource.get("overworld");

class OverworldState {

    constructor() {
        WorldStateManagers.overworld = this;
    }

    getList() {
        if (AREA_DATA != null) {
            const list = AREA_DATA.list;
            if (list != null) {
                const result = [];
                list.forEach(record => {
                    const loc = WorldStateManagers.get(record.category, record.id);
                    if (loc != null) {
                        result.push(record);
                    }
                });
                return result;
            }
        }
        return [];
    }

    getFilteredList() {
        if (AREA_DATA != null) {
            const list = AREA_DATA.list;
            if (list != null) {
                const result = [];
                list.forEach(record => {
                    const loc = WorldStateManagers.get(record.category, record.id);
                    if (!!loc && loc.visible) {
                        result.push(record);
                    }
                });
                return result;
            }
        }
        return AccessStateEnum.UNAVAILABLE;
    }

    get areaData() {
        return AREA_DATA;
    }

}

export default new OverworldState();
