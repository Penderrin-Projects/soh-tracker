//import StateStorage from "/script/storage/StateStorage.js";
import FilterMixin from "/script/state/mixins/FilterMixin.js";
import AreaStateEnum from "/script/enum/AreaStateEnum.js";
import WorldRegistry from "/script/state/WorldRegistry.js";

const AREA_DATA = new WeakMap();
const ACCESS = new WeakMap();

export default class DefaultState extends FilterMixin({}) {

    constructor(ref, props, areaData) {
        super(ref, props);
        /* --- */
        AREA_DATA.set(this, areaData);
        ACCESS.set(AreaStateEnum.UNAVAILABLE);

        // TODO calculate value on location/subarea/subexit/logic/state change

        /* register */
        WorldRegistry.set(`area/${ref}`, this);
    }

    get areaData() {
        return AREA_DATA.get(this);
    }

    get access() {
        return ACCESS.get(this);
    }

    getFilteredList() {
        const areaData = AREA_DATA.get(this);
        // XXX better would be "areaData.list"
        const list = areaData.lists["v"];
        if (list != null) {
            const result = [];
            list.forEach(record => {
                const id = `${record.category}/${record.id}`;
                const loc = WorldRegistry.get(id);
                if (!!loc && loc.visible) {
                    result.push(id);
                }
            });
            return result;
        }
    }

}
