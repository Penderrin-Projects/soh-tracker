import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import StateDataEventManager from "../../../util/StateDataEventManager.js";
import WorldRegistry from "../../../registry/WorldRegistry.js";
import ExitRegistry from "../../../registry/ExitRegistry.js";
import EntranceStates from "../entrance/StateManager.js";
import ExitState from "../../abstract/ExitState.js";
import Logic from "/script/util/logic/Logic.js";

const MANAGER = new WeakMap();
const ACCESS = new WeakMap();
const VALUE = new WeakMap();
const AREA = new WeakMap();

function getEntranceArea(value) {
    const entrance = EntranceStates.get(value) ?? EntranceStates.get(value.split(" -> ").reverse().join(" -> "));
    const area = WorldRegistry.get(entrance.props.area);
    if (area == null) {
        console.error(`area "${entrance.props.area}" not found for exit "${value}"`);
    }
    return area;
}

function getLogicAccess(access) {
    return (!!Logic.getValue(`${access}[child]`) || !!Logic.getValue(`${access}[adult]`));
}

function internalChange(event) {
    const access = this.props.access;
    // savesatate
    const change = event.data;
    if (change != null) {
        if (change.ref == access) {
            this./*#*/__setValue(change.value);
        } else if (change.value == access) {
            this./*#*/__setValue(change.ref);
        } else if (this.value == change.value) {
            if (!this.exitData.ignoreBound) {
                const otherExit = ExitRegistry.get(change.ref);
                if (!otherExit.exitData.ignoreBound) {
                    this./*#*/__setValue("");
                }
            }
        } else if (this.value == change.ref) {
            if (!this.exitData.ignoreBound) {
                const otherExit = ExitRegistry.get(change.value);
                if (!otherExit.exitData.ignoreBound) {
                    this./*#*/__setValue("");
                }
            }
        }
    }
}

export default class DefaultState extends ExitState {

    constructor(ref, props, exitData) {
        super(ref, props, exitData);
        /* --- */
        const manager = new StateDataEventManager();
        MANAGER.set(this, manager);
        manager.registerStateHandler("access", event => {
            const ev = new Event("access");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        manager.registerStateHandler("hint", event => {
            const ev = new Event("hint");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        /* --- */
        const logicAccess = props.access.split(" -> ")[0];
        ACCESS.set(this, getLogicAccess(logicAccess));
        this.value = StateStorage.readExtra("exits", props.access, "");
        /* EVENTS */
        EventBus.register("state::exit_binding", internalChange.bind(this));
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
        EventBus.register("logic", event => {
            const access = getLogicAccess(logicAccess);
            if (access != null) {
                const old = ACCESS.get(this);
                if (access != old) {
                    ACCESS.set(this, access);
                    const area = AREA.get(this);
                    if (area == null) {
                        // external
                        const ev = new Event("access");
                        ev.data = access;
                        this.dispatchEvent(ev);
                    }
                }
            }
        });
    }

    stateLoaded(event) {
        const props = this.props;
        // value
        if (event.data.extra["exits"] != null) {
            this.value = event.data.extra["exits"][props.access] ?? "";
        } else {
            this.value = "";
        }
    }

    /*#*/__setValue(value) {
        const ref = this.ref;
        const props = this.props;
        const old = VALUE.get(this);
        if (value == ref) {
            value = "";
        }
        if (value != old) {
            const manager = MANAGER.get(this);
            VALUE.set(this, value);
            StateStorage.writeExtra("exits", props.access, value);
            if (value) {
                const area = getEntranceArea(value);
                AREA.set(this, area);
                manager.switchState(area);
                // external
                const ev = new Event("access");
                ev.data = area.access;
                this.dispatchEvent(ev);
            } else {
                AREA.set(this, null);
                manager.switchState(null);
                // external
                const ev = new Event("access");
                ev.data = ACCESS.get(this);
                this.dispatchEvent(ev);
            }
            // external
            const event = new Event("value");
            event.data = value;
            this.dispatchEvent(event);
        }
        return value;
    }

    set value(value) {
        const old = this.value;
        value = this./*#*/__setValue(value);
        if (value != null && value != old) {
            // internal
            EventBus.trigger("state::exit_binding", {ref: this.props.access, value});
        }
    }

    get value() {
        return VALUE.get(this);
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
