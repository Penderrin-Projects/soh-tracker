// frameworks
import EventTargetManager from "/emcJS/event/EventTargetManager.js";
import LogicCompiler from "/emcJS/util/logic/Compiler.js";

import LogicExecutor from "../../../util/logic/LogicExecutor.js";
import DataState from "../../DataState.js";

const ACTIVE = new WeakMap();
const ACTIVE_LOGIC = new WeakMap();

export default class DefaultEntranceState extends DataState {

    constructor(ref, props) {
        super(ref, props);

        /* ACTIVE */
        if (typeof props.entranceActive == "object") {
            const logicFn = LogicCompiler.compile(props.entranceActive);
            const value = LogicExecutor.execute(logicFn);
            ACTIVE.set(this, value);
            ACTIVE_LOGIC.set(this, logicFn);
        } else {
            ACTIVE.set(this, !!props.entranceActive);
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

}
