import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import StateDataEventManager from "../../../util/StateDataEventManager.js";
import WorldRegistry from "../../../registry/WorldRegistry.js";
import ExitRegistry from "../../../registry/ExitRegistry.js";
import StateWorld from "../../abstract/StateWorld.js";
import Logic from "/script/util/logic/Logic.js";

const MANAGER = new WeakMap();
const EXIT_DATA = new WeakMap();
const ACCESS = new WeakMap();
const VALUE = new WeakMap();
const AREA = new WeakMap();

function getEntranceArea(value) {
    const entrance = ExitRegistry.get(value);
    return WorldRegistry.get(entrance.exitData.area);
}

function getLogicAccess(access) {
    return (!!Logic.getValue(`${access}[child]`) || !!Logic.getValue(`${access}[adult]`));
}

function getAccess(data, access) {
    return (!!data[`${access}[child]`] || !!data[`${access}[adult]`]);
}

function internalAreaChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this.area = change.newValue;
    }
}

export default class DefaultState extends StateWorld {

    constructor(ref, props, exitData) {
        super(ref, props);
        /* --- */
        const manager = new StateDataEventManager();
        MANAGER.set(this, manager);
        manager.registerStateHandler("access", event => {
            const ev = new Event("access");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        /* --- */
        const logicAccess = props.access.split(" -> ")[0];
        EXIT_DATA.set(this, exitData);
        ACCESS.set(this, getLogicAccess(logicAccess));
        this.value = StateStorage.readExtra("exits", props.access, "");
        /* EVENTS */
        EventBus.register("state::subexit_area", internalAreaChange.bind(this));
        EventBus.register("net::state::subexit_area", internalAreaChange.bind(this));
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
        EventBus.register("logic", event => {
            const access = getAccess(event.data, logicAccess);
            if (access != null) {
                ACCESS.set(this, access);
                const area = AREA.get(this);
                if (area == null) {
                    const ev = new Event("access");
                    ev.data = access;
                    this.dispatchEvent(ev);
                }
            }
        });
        /* register */
        ExitRegistry.set(props.access, this);
    }

    stateLoaded(event) {
        const props = this.props;
        if (event.data.extra.exits != null && event.data.extra.exits[props.access] != null) {
            this.value = event.data.extra.exits[props.access];
        } else {
            this.value = "";
        }
    }

    get exitData() {
        return EXIT_DATA.get(this);
    }

    get value() {
        return VALUE.get(this);
    }

    set value(value) {
        const ref = this.ref;
        const props = this.props;
        const old = VALUE.get(this);
        if (value != old) {
            const manager = MANAGER.get(this);
            VALUE.set(this, value);
            StateStorage.writeExtra("exits", props.access, value);
            if (value) {
                const area = getEntranceArea(value);
                AREA.set(this, area);
                manager.switchState(area);
            } else {
                AREA.set(this, null);
                manager.switchState(null);
            }
            // external
            const event = new Event("value");
            event.data = value;
            this.dispatchEvent(event);
            // internal
            EventBus.trigger("state::exit", {
                ref: ref,
                oldValue: old,
                newValue: value
            });
        }
    }

    get area() {
        return AREA.get(this);
    }

    get access() {
        const area = AREA.get(this);
        if (area != null) {
            return area.access;
        }
        return ACCESS.get(this);
    }

}
