import AccessStateEnum from "../../enum/AccessStateEnum.js";
import WorldRegistry from "../../registry/WorldRegistry.js";

const AREA_DATA = new WeakMap();

export default class OverworldState {

    constructor(areaData) {
        AREA_DATA.set(this, areaData);
        /* register */
        WorldRegistry.set("overworld", this);
    }

    getFilteredList() {
        const areaData = AREA_DATA.get(this);
        if (areaData != null) {
            const list = areaData.list;
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

    get areaData() {
        return AREA_DATA.get(this);
    }

}
