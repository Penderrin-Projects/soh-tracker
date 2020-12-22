import EventBus from "/emcJS/event/EventBus.js";
import StateFilter from "/script/state/abstract/StateFilter.js";
import AccessStateEnum from "/script/enum/AccessStateEnum.js";
import WorldRegistry from "/script/registries/WorldRegistry.js";
import ListLogic from "/script/util/logic/ListLogic.js";

const AREA_DATA = new WeakMap();
const ACCESS = new WeakMap();

export default class DefaultState extends StateFilter {

    constructor(ref, props, areaData) {
        super(ref, props);
        /* --- */
        AREA_DATA.set(this, areaData);
        ACCESS.set(this, AccessStateEnum.UNAVAILABLE);
        this.hint = "";
        /* EVENTS */
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
        EventBus.register(["logic", "state::location"], event => {
            this.calculateAvailability();
        });
        /* register */
        WorldRegistry.set(ref, this);
    }

    stateLoaded(event) {
        // update
        this.calculateAvailability();
    }

    calculateAvailability() {
        const list = this.getFilteredList();
        if (list != null) {
            const res = ListLogic.check(list);
            if (res != null) {
                ACCESS.set(this, res.value);
                // external
                const event = new Event("access");
                event.data = res.value;
                this.dispatchEvent(event);
            }
        }
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
    }

    get areaData() {
        return AREA_DATA.get(this);
    }

    get access() {
        return ACCESS.get(this);
    }

}
