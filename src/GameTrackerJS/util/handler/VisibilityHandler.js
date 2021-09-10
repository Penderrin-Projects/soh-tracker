// frameworks
import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import EventTargetManager from "/emcJS/event/EventTargetManager.js";

import LogicExecutor from "../logic/LogicExecutor.js";

const VISIBLE = new WeakMap();
const VISIBLE_LOGIC = new WeakMap();

export default class VisibilityHandler extends EventTarget {

    constructor(config = true) {
        super();
        /* VISIBLE */
        if (typeof config == "object") {
            const logicFn = LogicCompiler.compile(config);
            const value = LogicExecutor.execute(logicFn);
            VISIBLE.set(this, value);
            VISIBLE_LOGIC.set(this, logicFn);
        } else {
            VISIBLE.set(this, !!config);
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
                    const event = new Event("change");
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
