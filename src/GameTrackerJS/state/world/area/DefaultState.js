import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import AccessStateEnum from "../../../enum/AccessStateEnum.js";
import WorldRegistry from "../../../registry/WorldRegistry.js";
import StateWorld from "../../abstract/StateWorld.js";
import ListLogic from "/script/util/logic/ListLogic.js";

const AREA_DATA = new WeakMap();
const ACCESS = new WeakMap();
const HINT = new WeakMap();

function internalHintChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this.hint = change.value;
    }
}

export default class DefaultState extends StateWorld {

    constructor(ref, props, areaData) {
        super(ref, props);
        /* --- */
        AREA_DATA.set(this, areaData);
        ACCESS.set(this, ListLogic.DEFAULT);
        this.hint = StateStorage.readExtra("area_hint", ref, "");
        this.refreshAccess();
        /* EVENTS */
        EventBus.register("state::area_hint", internalHintChange.bind(this));
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
        EventBus.register(["logic", "state::location", "randomizer_options"], event => {
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
        const ref = this.ref;
        // hint
        if (event.data.extra["area_hint"] != null) {
            this.hint = event.data.extra["area_hint"][ref] ?? "";
        } else {
            this.hint = "";
        }
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
        return AccessStateEnum.UNAVAILABLE;
    }

    get areaData() {
        return AREA_DATA.get(this);
    }

    get access() {
        return ACCESS.get(this);
    }

    set hint(value) {
        const ref = this.ref;
        if (typeof value != "string" || (value != "woth" && value != "barren")) {
            value = "";
        }
        const old = this.hint;
        if (value != old) {
            HINT.set(this, value);
            StateStorage.writeExtra("area_hint", ref, value);
            // external
            const event = new Event("hint");
            event.data = value;
            this.dispatchEvent(event);
            // internal
            EventBus.trigger("state::area_hint", {ref, value});
        }
    }

    get hint() {
        return HINT.get(this);
    }

}
