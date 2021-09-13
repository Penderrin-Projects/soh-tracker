// frameworks
import DataStorageValueObserver from "/emcJS/datastorage/DataStorageValueObserver.js";
import EventBus from "/emcJS/event/EventBus.js";
import EventTargetManager from "/emcJS/event/EventTargetManager.js";
import LogicCompiler from "/emcJS/util/logic/Compiler.js";

import Savestate from "../../../savestate/Savestate.js";
import OptionsObserver from "../../../util/observer/OptionsObserver.js";
import StateDataEventManager from "../../../util/StateDataEventManager.js";
import AccessStateEnum from "../../../enum/AccessStateEnum.js";
import Logic from "../../../util/logic/Logic.js";
import LogicExecutor from "../../../util/logic/LogicExecutor.js";
import {defaultAccess as defaultMarkerAccess} from "../../../util/handler/MarkerListHandler.js";
import AreaStateManager from "../area/StateManager.js";
import EntranceStateManager from "../entrance/StateManager.js";
import { emptyState } from "../EmptyState.js";
import WorldState from "../WorldState.js";
import DefaultEntranceState from "../entrance/DefaultState.js";

const mixedEntrancePoolObserver = new OptionsObserver("option.mixed_entrance_pool");

const STORAGES = {
    exitBindings: Savestate.getStorage("exitBindings"),
};

const ACTIVE = new WeakMap();
const ACTIVE_LOGIC = new WeakMap();
const MANAGER = new WeakMap();
const ACCESS = new WeakMap();
const VALUE = new WeakMap();
const AREA = new WeakMap();

function getEntranceArea(value) {
    if (value == "") {
        return null;
    }
    if (value == "\u0000") {
        return emptyState;
    }
    const entrance = EntranceStateManager.get(value);
    if (entrance == null) {
        console.error(`exit "${value}" not found`);
        return null;
    }
    const area = AreaStateManager.get(entrance.props.area);
    if (area == null) {
        console.error(`area "${entrance.props.area}" not found for exit "${value}"`);
        return null;
    }
    return area;
}

function getLogicAccess(access) {
    const res = {
        done: 0,
        unopened: 0,
        reachable: 0,
        total: 0,
        value: AccessStateEnum.OPENED,
        entrances: 0
    };
    const reachable = (!!Logic.getValue(`${access}[child]`) || !!Logic.getValue(`${access}[adult]`));
    if (reachable) {
        res.entrances = 1;
        res.value = AccessStateEnum.AVAILABLE;
    } else {
        res.value = AccessStateEnum.UNAVAILABLE;
    }
    return res;
}

export default class DefaultExitState extends WorldState {

    constructor(ref, props) {
        super(ref, props);

        /* AREA */
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
        manager.registerStateHandler("list_update", event => {
            const ev = new Event("list_update");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });

        /* VALUES */
        const logicAccess = props.logicAccess;
        ACCESS.set(this, getLogicAccess(logicAccess));
        
        const exitBindingsObserver = new DataStorageValueObserver(STORAGES.exitBindings, ref, "");
        VALUE.set(this, exitBindingsObserver.value);
        exitBindingsObserver.addEventListener("change", (event) => {
            this.value = event.data;
        });

        setTimeout(() => {
            const area = getEntranceArea(this.value);
            AREA.set(this, area);
            manager.switchState(area);
            // external
            const ev = new Event("access");
            ev.data = area?.access ?? ACCESS.get(this);
            this.dispatchEvent(ev);
        }, 0);

        /* ACTIVE */
        if (typeof props.active == "object") {
            const logicFn = LogicCompiler.compile(props.active);
            const value = LogicExecutor.execute(logicFn);
            ACTIVE.set(this, value);
            ACTIVE_LOGIC.set(this, logicFn);
        } else {
            ACTIVE.set(this, !!props.active);
        }

        /* EVENTS */
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
                }
            }
        });
    }

    // TODO add reverse binding module
    /*#*/__internalChange(event) {
        // savesatate
        const change = event.data;
        if (change != null) {
            if (change.ref == this.ref) {
                // if this exit got bound
                super.value = change.value;
            } else if (change.value == this.ref) {
                // if this entrance got bound
                const otherExit = EntranceStateManager.get(change.ref);
                if (otherExit != null && otherExit.props.isBiDir) {
                    super.value = change.ref;
                }
            } else if (change.value != "" && change.value == this.value) {
                // if another exit got bound to this ones entrance
                if (change.value != "\u0000" && !this.props.ignoreBound) {
                    const otherExit = EntranceStateManager.get(change.ref);
                    if (otherExit != null && !otherExit.props.ignoreBound) {
                        super.value = "";
                    }
                }
            } else if (change.ref == this.value) {
                // if another entrance got bound to this ones exit
                // if the exit does no longer bind to this
                if (change.value != "\u0000" && !this.props.ignoreBound) {
                    const otherExit = EntranceStateManager.get(change.ref);
                    if (otherExit == null || !otherExit.props.ignoreBound) {
                        super.value = "";
                    }
                }
            }
        }
    }

    set value(value) {
        const old = VALUE.get(this);
        if (value == this.ref) {
            value = "";
        }
        if (value != old) {
            const manager = MANAGER.get(this);
            VALUE.set(this, value);
            STORAGES.exitBindings.set(this.ref, value);
            const area = getEntranceArea(value);
            AREA.set(this, area);
            manager.switchState(area);
            // external
            const ev = new Event("value");
            ev.data = value;
            this.dispatchEvent(ev);

            const ev2 = new Event("access");
            ev2.data = this.access;
            this.dispatchEvent(ev2);
        }
        return value;
    }

    get value() {
        return VALUE.get(this);
    }

    get area() {
        return AREA.get(this);
    }

    get active() {
        return ACTIVE.get(this);
    }

    get hint() {
        const area = AREA.get(this);
        if (area != null) {
            return area.hint;
        }
        return "";
    }

    get listContents() {
        const area = AREA.get(this);
        if (area != null) {
            return area.listContents;
        }
        return false;
    }

    get access() {
        const area = AREA.get(this);
        if (area != null) {
            return area.access;
        }
        return ACCESS.get(this) ?? defaultMarkerAccess;
    }

    checkBindable(entrance) {
        if (entrance instanceof DefaultEntranceState) {
            const ignoreBindsTo = mixedEntrancePoolObserver.value;
            const isActive = entrance.active || this.props.includeInactiveEntrances;
            return isActive && (ignoreBindsTo || this.props.bindsTo.indexOf(entrance.props.type) >= 0);
        }
        return false;
    }

    /* list */
    getRawList() {
        const area = AREA.get(this);
        if (area != null) {
            return area.getRawList();
        }
    }

    getList() {
        const area = AREA.get(this);
        if (area != null) {
            return area.getList();
        }
    }

    getFilteredList() {
        const area = AREA.get(this);
        if (area != null) {
            return area.getFilteredList();
        }
    }

    setAllEntries(value = true) {
        const area = AREA.get(this);
        if (area != null) {
            return area.setAllEntries(value);
        }
    }

}
