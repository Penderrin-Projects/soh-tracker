import EventBus from "/emcJS/event/EventBus.js";
import WorldRegistry from "../../../registry/WorldRegistry.js";
import StateWorld from "../../abstract/StateWorld.js";
import ListLogic from "/script/util/logic/ListLogic.js";

const AREA_DATA = new WeakMap();
const ACCESS = new WeakMap();

export default class DefaultState extends StateWorld {

    constructor(ref, props, areaData) {
        super(ref, props);
        /* --- */
        AREA_DATA.set(this, areaData);
        ACCESS.set(this, ListLogic.DEFAULT);
        this.refreshAccess();
        /* EVENTS */
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
        EventBus.register(["logic", "state::location"], event => {
            this.refreshAccess();
        });
    }

    /*#*/refreshAccess() {
        const access = this.calculateAvailability();
        if (access != null) {
            const old = ACCESS.get(this);
            if (old != access) {
                ACCESS.set(this, access);
                // external
                const event = new Event("access");
                event.data = access;
                this.dispatchEvent(event);
            }
        }
    }

    stateLoaded(event) {
        // nothing
    }

    calculateAvailability() {
        const list = this.getFilteredList();
        if (list != null) {
            return ListLogic.check(list);
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
