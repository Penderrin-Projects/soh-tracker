// frameworks
import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import EventTargetManager from "/emcJS/event/EventTargetManager.js";

import LogicExecutor from "../../util/logic/LogicExecutor.js";
import DataState from "./DataState.js";

const VISIBLE = new WeakMap();
const VISIBLE_LOGIC = new WeakMap();

export default class VisibilityState extends DataState {

    constructor(ref, props = {}) {
        super(ref, props);
        /* VISIBLE */
        if (typeof props.visible == "object") {
            const logicFn = LogicCompiler.compile(props.visible);
            const value = LogicExecutor.execute(logicFn);
            VISIBLE.set(this, value);
            VISIBLE_LOGIC.set(this, logicFn);
        } else {
            VISIBLE.set(this, !!props.visible);
        }
        /* EVENTS */
        const logicEventManager = new EventTargetManager(LogicExecutor);
        logicEventManager.set(["reset", "change"], event => {
            const logicFn = VISIBLE_LOGIC.get(this);
            if (typeof logicFn == "function") {
                const visible = VISIBLE.get(this);
                const value = LogicExecutor.execute(logicFn);
                if (visible != value) {
                    VISIBLE.set(this, value);
                    const event = new Event("visible");
                    event.data = value;
                    this.dispatchEvent(event);
                }
            }
        });
    }

    get visible() {
        return !!VISIBLE.get(this);
    }

}
