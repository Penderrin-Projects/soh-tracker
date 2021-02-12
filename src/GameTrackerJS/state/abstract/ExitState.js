/* asym-import: off */
import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import EventBus from "/emcJS/event/EventBus.js";
import EventTargetManager from "/emcJS/event/EventTargetManager.js";
/* asym-import: on */
import SavestateHandler from "../../savestate/SavestateHandler.js";
import StateDataEventManager from "../../util/StateDataEventManager.js";
import AccessStateEnum from "../../enum/AccessStateEnum.js";
import Logic from "../../util/logic/Logic.js";
import LogicExecutor from "../../util/logic/LogicExecutor.js";
import FilteredState from "./FilteredState.js";
import WorldStateManagers from "../world/StateManagers.js";
import EntranceStates from "../world/entrance/StateManager.js";

function getEntranceArea(value) {
    const entrance = EntranceStates.get(value) ?? EntranceStates.get(value.split(" -> ").reverse().join(" -> "));
    const area = WorldStateManagers.getByRef(entrance.props.area);
    if (area == null) {
        console.error(`area "${entrance.props.area}" not found for exit "${value}"`);
    }
    return area;
}

function getLogicAccess(access) {
    const res = {
        done: 0,
        unopened: 0,
        reachable: 0,
        entrances: false,
        value: AccessStateEnum.OPENED
    };
    const reachable = (!!Logic.getValue(`${access}[child]`) || !!Logic.getValue(`${access}[adult]`));
    if (reachable) {
        res.entrances = true;
        res.value = AccessStateEnum.AVAILABLE;
    } else {
        res.value = AccessStateEnum.UNAVAILABLE;
    }
    return res;
}

function internalChange(event) {
    const access = this.props.access;
    // savesatate
    const change = event.data;
    if (change != null) {
        if (change.ref == access) {
            // if this exit got bound
            this./*#*/__setValue(change.value);
        } else if (change.value == access) {
            // if this entrance got bound
            const otherExit = WorldStateManagers.getEntrance(change.ref);
            if (otherExit != null && otherExit.isBiDir) {
                this./*#*/__setValue(change.ref);
            }
        } else if (change.value != "" && change.value == this.value) {
            // if another exit got bound to this ones entrance
            if (!this.exitData.ignoreBound) {
                const otherExit = WorldStateManagers.getEntrance(change.ref);
                if (otherExit != null && !otherExit.ignoreBound) {
                    this./*#*/__setValue("");
                }
            }
        } else if (change.ref == this.value) {
            // if another entrance got bound to this ones exit
            // if the exit does no longer bind to this
            if (!this.exitData.ignoreBound) {
                const otherExit = WorldStateManagers.getEntrance(change.ref);
                if (otherExit == null || !otherExit.ignoreBound) {
                    this./*#*/__setValue("");
                }
            }
        }
    }
}

const EXIT_DATA = new WeakMap();
const ACTIVE = new WeakMap();
const ACTIVE_LOGIC = new WeakMap();
const MANAGER = new WeakMap();
const ACCESS = new WeakMap();
const VALUE = new WeakMap();
const AREA = new WeakMap();

export default class ExitState extends FilteredState {

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
        manager.registerStateHandler("hint", event => {
            const ev = new Event("hint");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        EXIT_DATA.set(this, exitData);
        const logicAccess = props.access.split(" -> ")[0];
        ACCESS.set(this, getLogicAccess(logicAccess));
        this.value = SavestateHandler.get("exits", props.access, "");
        /* ACTIVE */
        if (typeof exitData.active == "object") {
            const logicFn = LogicCompiler.compile(exitData.active);
            const value = LogicExecutor.execute(logicFn);
            ACTIVE.set(this, value);
            ACTIVE_LOGIC.set(this, logicFn);
        } else {
            ACTIVE.set(this, !!exitData.active);
        }
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
        const logicEventManager = new EventTargetManager(LogicExecutor);
        logicEventManager.set(["reset", "change"], event => {
            const logicFn = ACTIVE_LOGIC.get(this);
            if (typeof logicFn == "function") {
                const active = ACTIVE.get(this);
                const value = LogicExecutor.execute(logicFn);
                if (active != value) {
                    ACTIVE.set(this, value);
                    const event = new Event("active");
                    event.data = value;
                    this.dispatchEvent(event);
                    // internal
                    EventBus.trigger("state::exit_active", {ref: this.props.access, value});
                }
            }
        });
    }

    executeSpecialFilter(name) {
        const access = ACCESS.get(this);
        switch (name) {
            case "access": return access.value != AccessStateEnum.UNAVAILABLE;
            case "!access": return access.value == AccessStateEnum.UNAVAILABLE;
            case "done": return access.value == AccessStateEnum.OPENED;
            case "!done": return access.value != AccessStateEnum.OPENED;
        }
        return super.executeSpecialFilter(name);
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
            SavestateHandler.set("exits", props.access, value);
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

    get exitData() {
        return EXIT_DATA.get(this);
    }

    get access() {
        const area = AREA.get(this);
        if (area != null) {
            return area.access;
        }
        return ACCESS.get(this);
    }

    get area() {
        return AREA.get(this);
    }

    set value(value) {
        const old = this.value;
        value = this./*#*/__setValue(value);
        if (value != null && value != old) {
            // internal
            EventBus.trigger("state::exit_binding", { ref: this.props.access, value });
        }
    }

    get value() {
        return VALUE.get(this);
    }

    get active() {
        return ACTIVE.get(this);
    }

    setAllEntries(value = true) {
        const area = AREA.get(this);
        if (area != null) {
            return area.setAllEntries(value);
        }
    }

}
