import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import EventBus from "/emcJS/event/EventBus.js";
import EventTargetManager from "/emcJS/event/EventTargetManager.js";
import LogicExecutor from "../../util/LogicExecutor.js";
import ExitRegistry from "../../registry/ExitRegistry.js";
import WorldElementState from "./WorldElementState.js";

const EXIT_DATA = new WeakMap();
const ACTIVE = new WeakMap();
const ACTIVE_LOGIC = new WeakMap();

export default class ExitState extends WorldElementState {

    constructor(ref, props, exitData) {
        super(ref, props);
        /* --- */
        EXIT_DATA.set(this, exitData);
        /* ACTIVE */
        if (typeof exitData.active == "object") {
            const active_logic = LogicCompiler.compile(exitData.active);
            const value = LogicExecutor.execute(active_logic);
            ACTIVE.set(this, value);
            ACTIVE_LOGIC.set(this, active_logic);
        } else {
            ACTIVE.set(this, !!exitData.active);
        }
        /* EVENTS */
        const logicEventManager = new EventTargetManager(LogicExecutor);
        logicEventManager.set(["reset", "change"], event => {
            const active_logic = ACTIVE_LOGIC.get(this);
            if (typeof active_logic == "function") {
                const active = ACTIVE.get(this);
                const value = LogicExecutor.execute(active_logic);
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

        /* register */
        ExitRegistry.set(props.access, this);
    }

    get exitData() {
        return EXIT_DATA.get(this);
    }

    get active() {
        return ACTIVE.get(this);
    }

}
