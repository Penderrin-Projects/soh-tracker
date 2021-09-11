// frameworks
import EventTargetManager from "/emcJS/event/EventTargetManager.js";
import LogicCompiler from "/emcJS/util/logic/Compiler.js";

import OptionsObserver from "../../../util/observer/OptionsObserver.js";
import LogicExecutor from "../../../util/logic/LogicExecutor.js";
import DataState from "../../DataState.js";

const mixedEntrancePoolObserver = new OptionsObserver("option.mixed_entrance_pool");
const ACTIVE = new WeakMap();
const ACTIVE_LOGIC = new WeakMap();

export default class DefaultEntranceState extends DataState {

    constructor(ref, props) {
        super(ref, props);

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
        const logicEventManager = new EventTargetManager(LogicExecutor);
        logicEventManager.set(["reset", "change"], event => {
            const logicFn = ACTIVE_LOGIC.get(this);
            if (typeof logicFn == "function") {
                const visible = ACTIVE.get(this);
                const value = LogicExecutor.execute(logicFn);
                if (visible != value) {
                    ACTIVE.set(this, value);
                    const event = new Event("active");
                    event.data = value;
                    this.dispatchEvent(event);
                }
            }
        });
    }

    get active() {
        return ACTIVE.get(this);
    }

    checkBindable(exit) {
        if (exit instanceof DefaultEntranceState) {
            const ignoreBindsTo = mixedEntrancePoolObserver.value;
            const isActive = this.active || exit.props.includeInactiveEntrances;
            return isActive && (ignoreBindsTo || exit.props.bindsTo.indexOf(exit.props.type) >= 0);
        }
        return false;
    }

}
