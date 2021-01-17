import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import StateDataEventManager from "../../../util/StateDataEventManager.js";
import WorldRegistry from "../../../registry/WorldRegistry.js";
import ExitRegistry from "../../../registry/ExitRegistry.js";
import StateExit from "../../abstract/StateExit.js";
import Logic from "/script/util/logic/Logic.js";

const MANAGER = new WeakMap();
const ACCESS = new WeakMap();
const VALUE = new WeakMap();
const AREA = new WeakMap();

function getEntranceArea(value) {
    const entrance = ExitRegistry.get(value);
    const area = WorldRegistry.get(entrance.exitData.area);
    if (area == null) {
        console.error(`area "${entrance.exitData.area}" not found for exit "${value}"`);
    }
    return area;
}

function getLogicAccess(access) {
    return (!!Logic.getValue(`${access}[child]`) || !!Logic.getValue(`${access}[adult]`));
}

function internalChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null) {
        if (change.ref == ref) {
            this.value = change.value;
        } else if (this.value == change.value) {
            if (!this.exitData.ignoreBound) {
                const otherExit = WorldRegistry.get(change.ref);
                if (!otherExit.exitData.ignoreBound) {
                    this.value = "";
                }
            }
        }
    }
}

export default class DefaultState extends StateExit {

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
        /* --- */
        const logicAccess = props.access.split(" -> ")[0];
        ACCESS.set(this, getLogicAccess(logicAccess));
        this.value = StateStorage.readExtra("exits", ref, "");
        /* EVENTS */
        EventBus.register("state::subexit", internalChange.bind(this));
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
        EventBus.register("statechange_exits", event => {
            this.calculateEntrances();
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
        if (event.data.extra.exits != null && event.data.extra.exits[props.access] != null) {
            this.value = event.data.extra.exits[props.access];
        } else {
            this.value = "";
        }
    }
    
    /*#*/calculateEntrances() {
        const exits = StateStorage.readAllExtra("exits");
        const entrances = ExitRegistry.getAll();
        const possible = [];
        const exit = ExitRegistry.get(this.props.access);
        for (const key in entrances) {
            if (exits[key] == this.value) {
                const value = entrances[key];
                if (value.active && value.exitData.type == exit.exitData.type) {
                    possible.push(exits[key]);
                }
            }
        }
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
            // internal
            EventBus.trigger("state::subexit", {ref, value});
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
