// frameworks
import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";

import LogicExecutor from "../logic/LogicExecutor.js";

export default class LogicHandler extends EventTarget {

    #value = true;

    #logic = null;

    constructor(logic = true) {
        super();
        if (typeof logic == "object") {
            /* LOGIC */
            this.#logic = LogicCompiler.compile(logic);
            this.#value = LogicExecutor.execute(this.#logic);
            /* EVENTS */
            const logicEventManager = new EventTargetManager(LogicExecutor);
            logicEventManager.set(["reset", "change"], () => this.update());
        } else if (logic != null) {
            this.#logic = logic;
            this.#value = !!logic;
        }
    }

    update() {
        if (typeof this.#logic == "function") {
            const value = !!LogicExecutor.execute(this.#logic);
            if (this.#value != value) {
                this.#value = value;
                const event = new Event("change");
                event.value = value;
                this.dispatchEvent(event);
            }
        }
    }

    get value() {
        return !!this.#value;
    }

}
