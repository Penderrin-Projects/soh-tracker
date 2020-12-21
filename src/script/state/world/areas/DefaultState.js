import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import StateFilter from "/script/state/abstract/StateFilter.js";
import AccessStateEnum from "/script/enum/AccessStateEnum.js";
import WorldRegistry from "/script/state/WorldRegistry.js";
import ListLogic from "/script/util/logic/ListLogic.js";

const AREA_DATA = new WeakMap();
const ACCESS = new WeakMap();
const HINT = new WeakMap();

function internalHintChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this.hint = change.newValue;
    }
}

export default class DefaultState extends StateFilter {

    constructor(ref, props, areaData) {
        super(ref, props);
        /* --- */
        AREA_DATA.set(this, areaData);
        ACCESS.set(this, {
            done: 0,
            unopened: 0,
            reachable: 0,
            entrances: false,
            value: AccessStateEnum.UNAVAILABLE
        });
        this.hint = StateStorage.readExtra("area_hint", `area/${ref}`, "");
        this.calculateAvailability();
        /* EVENTS */
        EventBus.register("state::area_hint", internalHintChange.bind(this));
        EventBus.register("net::state::area_hint", internalHintChange.bind(this));
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
        EventBus.register(["logic", "state::location"], event => {
            this.calculateAvailability();
        });
        /* register */
        WorldRegistry.set(`area/${ref}`, this);
    }

    stateLoaded(event) {
        const ref = this.ref;
        // hint
        if (event.data.extra["area_hint"] != null && event.data.extra["area_hint"][`area/${ref}`] != null) {
            this.hint = event.data.extra["area_hint"][`area/${ref}`];
        } else {
            this.hint = "";
        }
    }

    calculateAvailability() {
        const list = this.getFilteredList();
        if (list != null) {
            const res = ListLogic.check(list);
            if (res != null) {
                ACCESS.set(this, res);
                // external
                const event = new Event("access");
                event.data = res;
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

    get filter() {
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
            StateStorage.writeExtra("area_hint", `area/${ref}`, value);
            // external
            const event = new Event("hint");
            event.data = value;
            this.dispatchEvent(event);
            // internal
            EventBus.trigger("state::area_hint", {
                ref: ref,
                oldValue: old,
                newValue: this.hint
            });
        }
    }

    get hint() {
        return HINT.get(this);
    }

}
