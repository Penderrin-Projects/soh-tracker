import AccessStateEnum from "../../enum/AccessStateEnum.js";
import WorldStateManagers from "./StateManagers.js";
import "./area/StateManager.js";
import "./subarea/StateManager.js";
import "./exit/StateManager.js";
import "./subexit/StateManager.js";
import "./location/StateManager.js";

const AREA_DATA = new WeakMap();

export default class OverworldState {

    constructor(areaData) {
        AREA_DATA.set(this, areaData);
    }

    getList() {
        const areaData = AREA_DATA.get(this);
        if (areaData != null) {
            const list = areaData.list;
            if (list != null) {
                const result = [];
                list.forEach(record => {
                    const Manager = WorldStateManagers[record.category];
                    const loc = Manager.get(record.id);
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
        const areaData = AREA_DATA.get(this);
        if (areaData != null) {
            const list = areaData.list;
            if (list != null) {
                const result = [];
                list.forEach(record => {
                    const Manager = WorldStateManagers[record.category];
                    const loc = Manager.get(record.id);
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
        return AREA_DATA.get(this);
    }

}
