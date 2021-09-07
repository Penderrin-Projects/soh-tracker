// frameworks
import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import EventBus from "/emcJS/event/EventBus.js";
import EventTargetManager from "/emcJS/event/EventTargetManager.js";

import SavestateHandler from "../../../savestate/SavestateHandler.js";
import StateDataEventManager from "../../../util/StateDataEventManager.js";
import AccessStateEnum from "../../../enum/AccessStateEnum.js";
import Logic from "../../../util/logic/Logic.js";
import LogicExecutor from "../../../util/logic/LogicExecutor.js";
import WorldState from "./WorldState.js";
import {defaultAccess as defaultMarkerAccess} from "../../../util/MarkerListHandler.js";
import WorldStateManager from "../WorldStateManager.js";
import EntranceStates from "../entrance/StateManager.js";

function getEntranceArea(value) {
    if (value == "") {
        return null;
    }
    if (value == "\u0000") {
        return WorldStateManager.getEmpty();
    }
    const entrance = EntranceStates.get(value) ?? EntranceStates.get(value.split(" -> ").reverse().join(" -> "));
    if (entrance == null) {
        console.error(`exit "${value}" not found`);
        return null;
    }
    const area = WorldStateManager.getByRef(entrance.props.area);
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

const EXIT_DATA = new WeakMap();
const ACTIVE = new WeakMap();
const ACTIVE_LOGIC = new WeakMap();
const MANAGER = new WeakMap();
const ACCESS = new WeakMap();
const VALUE = new WeakMap();
const AREA = new WeakMap();

export default class AbstractExitState extends WorldState {

    constructor(ref, props = {}, exitData = {}) {
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
        manager.registerStateHandler("list_update", event => {
            const ev = new Event("list_update");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        /* VALUES */
        const logicAccess = props.access.split(" -> ")[0];
        {
            EXIT_DATA.set(this, exitData);
            ACCESS.set(this, getLogicAccess(logicAccess));
            const value = SavestateHandler.get("exits", props.access, "")
            VALUE.set(this, value);
            setTimeout(() => {
                const area = getEntranceArea(value);
                AREA.set(this, area);
                manager.switchState(area);
                // external
                const ev = new Event("access");
                ev.data = area?.access ?? ACCESS.get(this);
                this.dispatchEvent(ev);
            }, 0);
        }
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

    executeSpecialFilter(name) {
        const access = ACCESS.get(this) ?? defaultMarkerAccess;
        if (access != null) {
            switch (name) {
                case "access": return access.value != AccessStateEnum.UNAVAILABLE;
                case "!access": return access.value == AccessStateEnum.UNAVAILABLE;
                case "done": return access.value == AccessStateEnum.OPENED;
                case "!done": return access.value != AccessStateEnum.OPENED;
            }
        }
        return super.executeSpecialFilter(name);
    }

    beforeStateLoad() {
        const manager = MANAGER.get(this);
        VALUE.set(this, "");
        AREA.set(this, null);
        manager.switchState();
    }

    onStateLoad(state) {
        const props = this.props;
        // value
        // TODO better load like on init(?)
        this.value = state?.data?.["exits"]?.[props.access] ?? "";
    }

    get exitData() {
        return EXIT_DATA.get(this);
    }

    get access() {
        const area = AREA.get(this);
        if (area != null) {
            return area.access;
        }
        return ACCESS.get(this) ?? defaultMarkerAccess;
    }

    get area() {
        return AREA.get(this);
    }

    set value(value) {
        const props = this.props;
        const old = VALUE.get(this);
        if (value == props.access) {
            value = "";
        }
        if (value != old) {
            const manager = MANAGER.get(this);
            VALUE.set(this, value);
            SavestateHandler.set("exits", props.access, value);
            const area = getEntranceArea(value);
            AREA.set(this, area);
            manager.switchState(area);
            // external
            const ev = new Event("access");
            ev.data = area?.access ?? ACCESS.get(this);
            this.dispatchEvent(ev);
            const ev2 = new Event("value");
            ev2.data = value;
            this.dispatchEvent(ev2);
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
