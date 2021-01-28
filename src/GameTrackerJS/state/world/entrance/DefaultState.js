import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import EventTargetManager from "/emcJS/event/EventTargetManager.js";
import LogicExecutor from "../../util/logic/LogicExecutor.js";
import DataState from "../../abstract/DataState.js";

const ACTIVE = new WeakMap();
const ACTIVE_LOGIC = new WeakMap();

export default class DefaultState extends DataState {

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

}
