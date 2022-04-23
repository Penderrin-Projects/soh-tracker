// frameworks
import DataStorageValueObserver from "/emcJS/datastorage/DataStorageValueObserver.js";

import Savestate from "../../../savestate/Savestate.js";
import OptionsObserver from "../../../util/observer/OptionsObserver.js";
import StateDataEventManager from "../../../util/StateDataEventManager.js";
import AccessStateEnum from "../../../enum/AccessStateEnum.js";
import Logic from "../../../util/logic/Logic.js";
import {
    getDefaultAccess
} from "../../../util/handler/StateListHandler.js";
import AreaStateManager from "../../../statemanager/world/area/AreaStateManager.js";
import EntranceStateManager from "../../../statemanager/world/entrance/EntranceStateManager.js";
import {
    emptyState
} from "../EmptyState.js";
import VisibilityState from "../VisibilityState.js";
import DefaultEntranceState from "../entrance/DefaultEntranceState.js";

const mixedEntrancePoolObserver = new OptionsObserver("option.mixed_entrance_pool");

const STORAGES = {exitBindings: Savestate.getStorage("exitBindings")};

const ENTRANCE = new WeakMap();
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
    const reachable = !!Logic.getValue(`${access}[child]`) || !!Logic.getValue(`${access}[adult]`);
    if (reachable) {
        res.entrances = 1;
        res.value = AccessStateEnum.AVAILABLE;
    } else {
        res.value = AccessStateEnum.UNAVAILABLE;
    }
    return res;
}

export default class DefaultExitState extends VisibilityState {

    constructor(ref, props) {
        super(ref, props);

        /* ENTRANCE */
        const entrance = EntranceStateManager.get(ref);
        entrance.addEventListener("active", (event) => {
            const ev = new Event("active");
            ev.data = event.data;
            this.dispatchEvent(ev);
        })
        ENTRANCE.set(this, entrance);

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

        /* LOGIC */
        Logic.addEventListener("change", () => {
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

    get active() {
        const entrance = ENTRANCE.get(this);
        return entrance.active;
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
            ev.newValue = value;
            ev.oldValue = old;
            this.dispatchEvent(ev);

            const ev2 = new Event("access");
            ev2.data = this.access;
            this.dispatchEvent(ev2);
        }
    }

    get value() {
        return VALUE.get(this);
    }

    get area() {
        return AREA.get(this);
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

    get defaultAccess() {
        return getDefaultAccess();
    }

    get access() {
        const area = AREA.get(this);
        if (area != null) {
            return area.access;
        }
        return ACCESS.get(this) ?? this.defaultAccess;
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
    getList() {
        const area = AREA.get(this);
        if (area != null) {
            return area.getList();
        }
        return [];
    }

    setAllEntries(value = true) {
        const area = AREA.get(this);
        if (area != null) {
            return area.setAllEntries(value);
        }
    }

}
